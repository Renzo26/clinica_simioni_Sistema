import uuid
from datetime import datetime, timedelta, timezone

import anthropic
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.clinica import Clinica
from app.models.consulta import Consulta
from app.models.paciente import Paciente
from app.models.conversation import Conversation, ConversationStatus

_client = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = get_settings().anthropic_api_key
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY não configurada")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


async def _build_context(db: AsyncSession, clinica_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = now - timedelta(days=30)
    week_end_str = (now + timedelta(days=7)).strftime("%Y-%m-%d")

    clinica = await db.scalar(select(Clinica).where(Clinica.id == clinica_id))

    total_pacientes = await db.scalar(
        select(func.count(Paciente.id)).where(Paciente.clinica_id == clinica_id)
    ) or 0

    pacientes_last_30d = await db.scalar(
        select(func.count(Paciente.id))
        .where(Paciente.clinica_id == clinica_id)
        .where(Paciente.created_at >= thirty_days_ago)
    ) or 0

    all_pacientes = list((await db.scalars(
        select(Paciente)
        .where(Paciente.clinica_id == clinica_id)
        .order_by(Paciente.created_at.desc())
        .limit(50)
    )).all())

    consultas_today = list((await db.scalars(
        select(Consulta)
        .where(Consulta.clinica_id == clinica_id)
        .where(Consulta.data == today_str)
        .order_by(Consulta.hora)
    )).all())

    consultas_week = list((await db.scalars(
        select(Consulta)
        .where(Consulta.clinica_id == clinica_id)
        .where(Consulta.data > today_str)
        .where(Consulta.data <= week_end_str)
        .order_by(Consulta.data, Consulta.hora)
    )).all())

    open_convs = await db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.status.in_([
                ConversationStatus.UNASSIGNED,
                ConversationStatus.HUMAN,
                ConversationStatus.BOT,
            ])
        )
    ) or 0

    resolved_today = await db.scalar(
        select(func.count(Conversation.id))
        .where(Conversation.status == ConversationStatus.RESOLVED)
        .where(Conversation.updated_at >= today_start)
    ) or 0

    lines = [
        f"Data de hoje: {today_str}",
        "",
        "=== CLÍNICA ===",
        f"Nome: {clinica.name if clinica else 'Clínica Simioni'}",
    ]
    if clinica:
        if clinica.phone:
            lines.append(f"Telefone: {clinica.phone}")
        if clinica.address:
            lines.append(f"Endereço: {clinica.address}, {clinica.city or ''} - {clinica.state or ''}")
        if clinica.horario_atendimento:
            lines.append(f"Horário: {clinica.horario_atendimento}")
        if clinica.especialidades:
            lines.append(f"Especialidades: {clinica.especialidades}")

    lines += [
        "",
        "=== PACIENTES ===",
        f"Total de pacientes cadastrados: {total_pacientes}",
        f"Novos pacientes nos últimos 30 dias: {pacientes_last_30d}",
    ]

    if all_pacientes:
        lines.append("\nÚltimos 5 pacientes cadastrados:")
        for p in all_pacientes[:5]:
            info = f"  - {p.nome}"
            if p.convenio:
                info += f" | Convênio: {p.convenio}"
            if p.ultimo_atendimento:
                info += f" | Último atendimento: {p.ultimo_atendimento}"
            if p.observacoes:
                info += f" | Obs: {p.observacoes[:100]}"
            lines.append(info)

    lines += [
        "",
        "=== AGENDA ===",
        f"Consultas hoje ({today_str}): {len(consultas_today)}",
    ]
    for c in consultas_today:
        esp = f" ({c.especialidade})" if c.especialidade else ""
        prof = f" — Dr(a). {c.profissional}" if c.profissional else ""
        lines.append(f"  {c.hora} - {c.paciente}{esp}{prof} | {c.status}")

    if consultas_week:
        lines.append(f"Próximas consultas (próximos 7 dias): {len(consultas_week)}")
        for c in consultas_week[:5]:
            esp = f" ({c.especialidade})" if c.especialidade else ""
            lines.append(f"  {c.data} {c.hora} - {c.paciente}{esp}")

    lines += [
        "",
        "=== CONVERSAS (WhatsApp) ===",
        f"Conversas abertas/em atendimento: {open_convs}",
        f"Conversas resolvidas hoje: {resolved_today}",
    ]

    return "\n".join(lines)


async def chat(
    db: AsyncSession,
    clinica_id: uuid.UUID,
    question: str,
    history: list[dict],
) -> str:
    context = await _build_context(db, clinica_id)

    system = f"""Você é o assistente interno da Clínica Simioni, sistema de gestão clínica multidisciplinar.
Você tem acesso aos dados reais da clínica e responde perguntas com base nessas informações.
Seja direto, objetivo e use os dados fornecidos. Responda sempre em português do Brasil.
A clínica atende nas áreas de Neuropsicologia, Psicologia, Fonoaudiologia, Psicopedagogia e outras especialidades médicas.

{context}"""

    messages = []
    for msg in history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": question})

    response = _get_client().messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        system=system,
        messages=messages,
    )

    return response.content[0].text
