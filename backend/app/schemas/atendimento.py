import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AtendimentoIn(BaseModel):
    data: str
    hora: Optional[str] = None
    tipo: str = "Consulta"
    profissional: Optional[str] = None
    observacoes: Optional[str] = None


class AtendimentoOut(AtendimentoIn):
    id: uuid.UUID
    paciente_id: uuid.UUID
    clinica_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
