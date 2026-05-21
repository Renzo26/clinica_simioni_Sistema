import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Atendimento(Base):
    __tablename__ = "atendimentos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    paciente_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    clinica_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinicas.id"), nullable=False, index=True
    )
    data: Mapped[str] = mapped_column(String(10), nullable=False)
    hora: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    tipo: Mapped[str] = mapped_column(String(50), nullable=False, default="Consulta")
    profissional: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    paciente: Mapped["Paciente"] = relationship("Paciente", back_populates="atendimentos")  # noqa: F821
