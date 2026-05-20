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
    conn = op.get_bind()

    # === enums (DO/EXCEPTION para suportar re-runs — CREATE TYPE não tem IF NOT EXISTS) ===
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('ADMIN', 'SECRETARIA', 'PROFISSIONAL');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE conversation_status AS ENUM ('BOT', 'HUMAN', 'UNASSIGNED', 'RESOLVED');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'DOCUMENT');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    # === clinicas ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS clinicas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200) NOT NULL,
            cnpj VARCHAR(20) UNIQUE,
            phone VARCHAR(20),
            email VARCHAR(200),
            address VARCHAR(300),
            city VARCHAR(100),
            state VARCHAR(2),
            cep VARCHAR(10),
            horario_atendimento VARCHAR(300),
            especialidades TEXT,
            bot_info TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))

    # === users ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clinica_id UUID NOT NULL REFERENCES clinicas(id),
            name VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL UNIQUE,
            password_hash VARCHAR(200) NOT NULL,
            role user_role NOT NULL DEFAULT 'ADMIN',
            especialidade VARCHAR(100),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_users_clinica_id ON users(clinica_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_users_email ON users(email)"))

    # === pacientes ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS pacientes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clinica_id UUID NOT NULL REFERENCES clinicas(id),
            nome VARCHAR(200) NOT NULL,
            telefone VARCHAR(20),
            email VARCHAR(200),
            data_nascimento VARCHAR(10),
            cpf VARCHAR(14),
            convenio VARCHAR(100),
            observacoes TEXT,
            ultimo_atendimento VARCHAR(10),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_pacientes_clinica_id ON pacientes(clinica_id)"))

    # === consultas ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS consultas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clinica_id UUID NOT NULL REFERENCES clinicas(id),
            data VARCHAR(10) NOT NULL,
            hora VARCHAR(5) NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            paciente VARCHAR(200) NOT NULL,
            telefone VARCHAR(20),
            especialidade VARCHAR(100),
            profissional VARCHAR(200),
            status VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_consultas_clinica_id ON consultas(clinica_id)"))

    # === etiquetas ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS etiquetas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clinica_id UUID NOT NULL REFERENCES clinicas(id),
            nome VARCHAR(100) NOT NULL,
            cor VARCHAR(20),
            descricao TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_etiquetas_clinica_id ON etiquetas(clinica_id)"))

    # === conversations ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS conversations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            waha_chat_id VARCHAR(100) NOT NULL UNIQUE,
            lead_name VARCHAR(200) NOT NULL,
            lead_phone VARCHAR(20) NOT NULL,
            session VARCHAR(50) NOT NULL DEFAULT 'default',
            status conversation_status NOT NULL DEFAULT 'UNASSIGNED',
            assigned_agent_id VARCHAR(100),
            assigned_agent_name VARCHAR(200),
            unread_count INTEGER NOT NULL DEFAULT 0,
            last_message TEXT,
            last_message_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_conversations_waha_chat_id ON conversations(waha_chat_id)"))

    # === messages ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID NOT NULL REFERENCES conversations(id),
            content TEXT NOT NULL,
            type message_type NOT NULL DEFAULT 'TEXT',
            sender_name VARCHAR(200),
            is_from_lead BOOLEAN NOT NULL DEFAULT FALSE,
            media_url TEXT,
            waha_message_id VARCHAR(200) UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_messages_conversation_id ON messages(conversation_id)"))

    # === conversation_labels ===
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS conversation_labels (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID NOT NULL REFERENCES conversations(id),
            name VARCHAR(100) NOT NULL,
            color VARCHAR(20),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_conv_labels_conv_id ON conversation_labels(conversation_id)"))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS conversation_labels CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS messages CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS conversations CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS etiquetas CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS consultas CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS pacientes CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS clinicas CASCADE"))
    conn.execute(sa.text("DROP TYPE IF EXISTS message_type"))
    conn.execute(sa.text("DROP TYPE IF EXISTS conversation_status"))
    conn.execute(sa.text("DROP TYPE IF EXISTS user_role"))
