import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_clinica_id
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteIn, PacienteOut

router = APIRouter(prefix="/pacientes", tags=["pacientes"])


async def _get_or_404(paciente_id: uuid.UUID, clinica_id: uuid.UUID, db: AsyncSession) -> Paciente:
    paciente = await db.scalar(
        select(Paciente).where(Paciente.id == paciente_id, Paciente.clinica_id == clinica_id)
    )
    if not paciente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente não encontrado")
    return paciente


@router.get("", response_model=list[PacienteOut])
async def list_pacientes(
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    result = await db.scalars(select(Paciente).where(Paciente.clinica_id == clinica_id))
    return result.all()


@router.post("", response_model=PacienteOut, status_code=status.HTTP_201_CREATED)
async def create_paciente(
    body: PacienteIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    paciente = Paciente(clinica_id=clinica_id, **body.model_dump())
    db.add(paciente)
    await db.commit()
    await db.refresh(paciente)
    return paciente


@router.put("/{paciente_id}", response_model=PacienteOut)
async def update_paciente(
    paciente_id: uuid.UUID,
    body: PacienteIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    paciente = await _get_or_404(paciente_id, clinica_id, db)
    for field, value in body.model_dump().items():
        setattr(paciente, field, value)
    await db.commit()
    await db.refresh(paciente)
    return paciente


@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paciente(
    paciente_id: uuid.UUID,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    paciente = await _get_or_404(paciente_id, clinica_id, db)
    await db.delete(paciente)
    await db.commit()
