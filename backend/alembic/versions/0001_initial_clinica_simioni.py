"""initial schema clinica simioni

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-20
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # === clinicas ===
    op.create_table(
        "clinicas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("cnpj", sa.String(20), nullable=True, unique=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(200), nullable=True),
        sa.Column("address", sa.String(300), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("state", sa.String(2), nullable=True),
        sa.Column("cep", sa.String(10), nullable=True),
        sa.Column("horario_atendimento", sa.String(300), nullable=True),
        sa.Column("especialidades", sa.Text, nullable=True),
        sa.Column("bot_info", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === users ===
    user_role = postgresql.ENUM("ADMIN", "SECRETARIA", "PROFISSIONAL", name="user_role")
    user_role.create(op.get_bind())

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "clinica_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("clinicas.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), nullable=False, unique=True, index=True),
        sa.Column("password_hash", sa.String(200), nullable=False),
        sa.Column(
            "role",
            sa.Enum("ADMIN", "SECRETARIA", "PROFISSIONAL", name="user_role", create_type=False),
            nullable=False,
        ),
        sa.Column("especialidade", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === pacientes ===
    op.create_table(
        "pacientes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "clinica_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("clinicas.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("nome", sa.String(200), nullable=False),
        sa.Column("telefone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(200), nullable=True),
        sa.Column("data_nascimento", sa.String(10), nullable=True),
        sa.Column("cpf", sa.String(14), nullable=True),
        sa.Column("convenio", sa.String(100), nullable=True),
        sa.Column("observacoes", sa.Text, nullable=True),
        sa.Column("ultimo_atendimento", sa.String(10), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === consultas ===
    op.create_table(
        "consultas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "clinica_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("clinicas.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("data", sa.String(10), nullable=False),
        sa.Column("hora", sa.String(5), nullable=False),
        sa.Column("titulo", sa.String(200), nullable=False),
        sa.Column("paciente", sa.String(200), nullable=False),
        sa.Column("telefone", sa.String(20), nullable=True),
        sa.Column("especialidade", sa.String(100), nullable=True),
        sa.Column("profissional", sa.String(200), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="AGENDADO"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === etiquetas ===
    op.create_table(
        "etiquetas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "clinica_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("clinicas.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("cor", sa.String(20), nullable=True),
        sa.Column("descricao", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === conversations ===
    conv_status = postgresql.ENUM(
        "BOT", "HUMAN", "UNASSIGNED", "RESOLVED", name="conversation_status"
    )
    conv_status.create(op.get_bind())

    op.create_table(
        "conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("waha_chat_id", sa.String(100), unique=True, nullable=False, index=True),
        sa.Column("lead_name", sa.String(200), nullable=False),
        sa.Column("lead_phone", sa.String(20), nullable=False),
        sa.Column("session", sa.String(50), nullable=False, server_default="default"),
        sa.Column(
            "status",
            sa.Enum("BOT", "HUMAN", "UNASSIGNED", "RESOLVED", name="conversation_status", create_type=False),
            nullable=False,
            server_default="UNASSIGNED",
        ),
        sa.Column("assigned_agent_id", sa.String(100), nullable=True),
        sa.Column("assigned_agent_name", sa.String(200), nullable=True),
        sa.Column("unread_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_message", sa.Text, nullable=True),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === messages ===
    msg_type = postgresql.ENUM("TEXT", "IMAGE", "AUDIO", "DOCUMENT", name="message_type")
    msg_type.create(op.get_bind())

    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "conversation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("conversations.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column(
            "type",
            sa.Enum("TEXT", "IMAGE", "AUDIO", "DOCUMENT", name="message_type", create_type=False),
            nullable=False,
            server_default="TEXT",
        ),
        sa.Column("sender_name", sa.String(200), nullable=True),
        sa.Column("is_from_lead", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("media_url", sa.Text, nullable=True),
        sa.Column("waha_message_id", sa.String(200), nullable=True, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # === conversation_labels ===
    op.create_table(
        "conversation_labels",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "conversation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("conversations.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("color", sa.String(20), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("conversation_labels")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("etiquetas")
    op.drop_table("consultas")
    op.drop_table("pacientes")
    op.drop_table("users")
    op.drop_table("clinicas")
    op.execute("DROP TYPE IF EXISTS message_type")
    op.execute("DROP TYPE IF EXISTS conversation_status")
    op.execute("DROP TYPE IF EXISTS user_role")
