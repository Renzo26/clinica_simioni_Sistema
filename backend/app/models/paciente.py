import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    clinica_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinicas.id"), nullable=False, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    data_nascimento: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    cpf: Mapped[Optional[str]] = mapped_column(String(14), nullable=True)
    convenio: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ultimo_atendimento: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    clinica: Mapped["Clinica"] = relationship(  # noqa: F821
        "Clinica", back_populates="pacientes"
    )
