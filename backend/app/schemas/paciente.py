import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PacienteIn(BaseModel):
    nome: str
    telefone: Optional[str] = None
    email: Optional[str] = None
    data_nascimento: Optional[str] = None
    cpf: Optional[str] = None
    convenio: Optional[str] = None
    observacoes: Optional[str] = None
    ultimo_atendimento: Optional[str] = None


class PacienteOut(PacienteIn):
    id: uuid.UUID
    clinica_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
