"""add atendimentos table

Revision ID: 0002_add_atendimentos
Revises: 0001_initial
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_add_atendimentos"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "atendimentos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("paciente_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("clinica_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinicas.id"), nullable=False, index=True),
        sa.Column("data", sa.String(10), nullable=False),
        sa.Column("hora", sa.String(5), nullable=True),
        sa.Column("tipo", sa.String(50), nullable=False, server_default="Consulta"),
        sa.Column("profissional", sa.String(200), nullable=True),
        sa.Column("observacoes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("atendimentos")
