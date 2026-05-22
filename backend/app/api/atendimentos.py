import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_clinica_id
from app.api.pacientes import _get_or_404
from app.models.atendimento import Atendimento
from app.models.paciente import Paciente
from app.schemas.atendimento import AtendimentoIn, AtendimentoOut

router = APIRouter(prefix="/pacientes/{paciente_id}/atendimentos", tags=["atendimentos"])


@router.get("", response_model=list[AtendimentoOut])
async def list_atendimentos(
    paciente_id: uuid.UUID,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    await _get_or_404(paciente_id, clinica_id, db)
    result = await db.scalars(
        select(Atendimento)
        .where(Atendimento.paciente_id == paciente_id, Atendimento.clinica_id == clinica_id)
        .order_by(Atendimento.data.desc(), Atendimento.created_at.desc())
    )
    return result.all()


@router.post("", response_model=AtendimentoOut, status_code=status.HTTP_201_CREATED)
async def create_atendimento(
    paciente_id: uuid.UUID,
    body: AtendimentoIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    paciente = await _get_or_404(paciente_id, clinica_id, db)

    atendimento = Atendimento(
        paciente_id=paciente_id,
        clinica_id=clinica_id,
        **body.model_dump(),
    )
    db.add(atendimento)

    # Atualiza ultimo_atendimento no paciente se a data for mais recente
    if not paciente.ultimo_atendimento or body.data >= paciente.ultimo_atendimento:
        paciente.ultimo_atendimento = body.data

    await db.commit()
    await db.refresh(atendimento)
    return atendimento
