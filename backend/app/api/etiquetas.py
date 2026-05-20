import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_clinica_id
from app.models.etiqueta import Etiqueta
from app.schemas.etiqueta import EtiquetaIn, EtiquetaOut

router = APIRouter(prefix="/etiquetas", tags=["etiquetas"])


async def _get_or_404(etiqueta_id: uuid.UUID, clinica_id: uuid.UUID, db: AsyncSession) -> Etiqueta:
    etiqueta = await db.scalar(
        select(Etiqueta).where(Etiqueta.id == etiqueta_id, Etiqueta.clinica_id == clinica_id)
    )
    if not etiqueta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Etiqueta não encontrada")
    return etiqueta


@router.get("", response_model=list[EtiquetaOut])
async def list_etiquetas(
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    result = await db.scalars(select(Etiqueta).where(Etiqueta.clinica_id == clinica_id))
    return result.all()


@router.post("", response_model=EtiquetaOut, status_code=status.HTTP_201_CREATED)
async def create_etiqueta(
    body: EtiquetaIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    etiqueta = Etiqueta(clinica_id=clinica_id, **body.model_dump())
    db.add(etiqueta)
    await db.commit()
    await db.refresh(etiqueta)
    return etiqueta


@router.put("/{etiqueta_id}", response_model=EtiquetaOut)
async def update_etiqueta(
    etiqueta_id: uuid.UUID,
    body: EtiquetaIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    etiqueta = await _get_or_404(etiqueta_id, clinica_id, db)
    for field, value in body.model_dump().items():
        setattr(etiqueta, field, value)
    await db.commit()
    await db.refresh(etiqueta)
    return etiqueta


@router.delete("/{etiqueta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_etiqueta(
    etiqueta_id: uuid.UUID,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    etiqueta = await _get_or_404(etiqueta_id, clinica_id, db)
    await db.delete(etiqueta)
    await db.commit()
