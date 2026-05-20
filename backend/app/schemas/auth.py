import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr


class RegisterIn(BaseModel):
    clinica_name: str
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class ClinicaOut(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    especialidade: Optional[str] = None
    clinica_id: uuid.UUID

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
    clinica: ClinicaOut
