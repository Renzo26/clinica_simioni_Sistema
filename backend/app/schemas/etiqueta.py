import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EtiquetaIn(BaseModel):
    nome: str
    cor: Optional[str] = None
    descricao: Optional[str] = None


class EtiquetaOut(EtiquetaIn):
    id: uuid.UUID
    clinica_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
