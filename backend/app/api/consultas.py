import re
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_clinica_id
from app.models.clinica import Clinica
from app.models.consulta import Consulta
from app.models.conversation import Conversation
from app.schemas.consulta import ConsultaIn, ConsultaOut
from app.services.conversation_service import conversation_service
from app.services.waha_service import waha_service

router = APIRouter(prefix="/consultas", tags=["consultas"])


async def _get_or_404(
    consulta_id: uuid.UUID, clinica_id: uuid.UUID, db: AsyncSession
) -> Consulta:
    consulta = await db.scalar(
        select(Consulta).where(
            Consulta.id == consulta_id, Consulta.clinica_id == clinica_id
        )
    )
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Consulta não encontrada"
        )
    return consulta


@router.get("", response_model=list[ConsultaOut])
async def list_consultas(
    data: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    stmt = select(Consulta).where(Consulta.clinica_id == clinica_id)
    if data:
        stmt = stmt.where(Consulta.data == data)
    result = await db.scalars(stmt)
    return result.all()


@router.post("", response_model=ConsultaOut, status_code=status.HTTP_201_CREATED)
async def create_consulta(
    body: ConsultaIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    consulta = Consulta(clinica_id=clinica_id, **body.model_dump())
    db.add(consulta)
    await db.commit()
    await db.refresh(consulta)
    return consulta


@router.put("/{consulta_id}", response_model=ConsultaOut)
async def update_consulta(
    consulta_id: uuid.UUID,
    body: ConsultaIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    consulta = await _get_or_404(consulta_id, clinica_id, db)
    for field, value in body.model_dump().items():
        setattr(consulta, field, value)
    await db.commit()
    await db.refresh(consulta)
    return consulta


@router.delete("/{consulta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_consulta(
    consulta_id: uuid.UUID,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    consulta = await _get_or_404(consulta_id, clinica_id, db)

    telefone = consulta.telefone
    paciente = consulta.paciente
    titulo = consulta.titulo
    data = consulta.data
    hora = consulta.hora
    especialidade = consulta.especialidade

    await db.delete(consulta)
    await db.commit()

    if not telefone:
        return

    digits = re.sub(r"\D", "", telefone.split("@")[0])
    if not digits:
        return

    waha_chat_id = f"{digits}@c.us"

    clinica = await db.scalar(select(Clinica).where(Clinica.id == clinica_id))
    clinica_name = clinica.name if clinica else "Clínica Simioni"

    especialidade_txt = f" ({especialidade})" if especialidade else ""
    msg_text = (
        f"Olá, {paciente}! Passando para informar que sua consulta de "
        f"{titulo}{especialidade_txt} marcada para o dia {data} às {hora} foi cancelada. "
        f"Caso queira reagendar, é só nos chamar aqui! — {clinica_name}"
    )

    conv = await db.scalar(select(Conversation).where(Conversation.waha_chat_id == waha_chat_id))
    if conv:
        await conversation_service.send_message(db, conv, msg_text, "Secretaria")
        await db.commit()
    else:
        await waha_service.send_text(waha_chat_id, msg_text)
