import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Consulta(Base):
    __tablename__ = "consultas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    clinica_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinicas.id"), nullable=False, index=True
    )
    data: Mapped[str] = mapped_column(String(10), nullable=False)
    hora: Mapped[str] = mapped_column(String(5), nullable=False)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    paciente: Mapped[str] = mapped_column(String(200), nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    especialidade: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    profissional: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="AGENDADO")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    clinica: Mapped["Clinica"] = relationship(  # noqa: F821
        "Clinica", back_populates="consultas"
    )
