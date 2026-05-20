from typing import Optional
from pydantic import BaseModel


class ClinicaSettingsIn(BaseModel):
    name: str
    cnpj: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    cep: Optional[str] = None
    horario_atendimento: Optional[str] = None
    especialidades: Optional[str] = None
    bot_info: Optional[str] = None


class ClinicaSettingsOut(ClinicaSettingsIn):
    model_config = {"from_attributes": True}
