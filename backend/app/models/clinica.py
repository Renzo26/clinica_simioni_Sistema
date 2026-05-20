import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Clinica(Base):
    __tablename__ = "clinicas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    cnpj: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    cep: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    horario_atendimento: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    especialidades: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bot_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    users: Mapped[list["User"]] = relationship(  # noqa: F821
        "User", back_populates="clinica", cascade="all, delete-orphan"
    )
    pacientes: Mapped[list["Paciente"]] = relationship(  # noqa: F821
        "Paciente", back_populates="clinica", cascade="all, delete-orphan"
    )
    consultas: Mapped[list["Consulta"]] = relationship(  # noqa: F821
        "Consulta", back_populates="clinica", cascade="all, delete-orphan"
    )
    etiquetas: Mapped[list["Etiqueta"]] = relationship(  # noqa: F821
        "Etiqueta", back_populates="clinica", cascade="all, delete-orphan"
    )
