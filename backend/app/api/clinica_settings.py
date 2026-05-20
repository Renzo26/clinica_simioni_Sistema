import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_clinica_id
from app.models.clinica import Clinica
from app.schemas.clinica_settings import ClinicaSettingsIn, ClinicaSettingsOut

router = APIRouter(prefix="/clinica", tags=["clinica"])


@router.get("", response_model=ClinicaSettingsOut)
async def get_settings(
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    clinica = await db.scalar(select(Clinica).where(Clinica.id == clinica_id))
    if not clinica:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clínica não encontrada")
    return clinica


@router.put("", response_model=ClinicaSettingsOut)
async def update_settings(
    body: ClinicaSettingsIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    clinica = await db.scalar(select(Clinica).where(Clinica.id == clinica_id))
    if not clinica:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clínica não encontrada")
    for field, value in body.model_dump().items():
        setattr(clinica, field, value)
    await db.commit()
    await db.refresh(clinica)
    return clinica
