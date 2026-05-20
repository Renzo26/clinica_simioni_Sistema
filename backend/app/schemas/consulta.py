import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConsultaIn(BaseModel):
    data: str
    hora: str
    titulo: str
    paciente: str
    telefone: Optional[str] = None
    especialidade: Optional[str] = None
    profissional: Optional[str] = None
    status: str = "AGENDADO"


class ConsultaOut(ConsultaIn):
    id: uuid.UUID
    clinica_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
