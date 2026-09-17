"""ai chat: ai_sessions, ai_messages

Revision ID: 0003_ai_sessions
Revises: 0002_customer_success
Create Date: 2026-09-17

"""

import sqlalchemy as sa

from alembic import op

revision = "0003_ai_sessions"
down_revision = "0002_customer_success"
branch_labels = None
depends_on = None

GUID = sa.CHAR(36)


def upgrade() -> None:
    op.create_table(
        "ai_sessions",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=True),
        sa.Column("usuario", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ai_sessions_cliente_id", "ai_sessions", ["cliente_id"])

    op.create_table(
        "ai_messages",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("session_id", GUID, sa.ForeignKey("ai_sessions.id"), nullable=False),
        sa.Column("papel", sa.Enum("user", "assistant", name="papel"), nullable=False),
        sa.Column("conteudo", sa.Text(), nullable=False),
        sa.Column("referencias_utilizadas", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ai_messages_session_id", "ai_messages", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_ai_messages_session_id", table_name="ai_messages")
    op.drop_table("ai_messages")
    op.drop_index("ix_ai_sessions_cliente_id", table_name="ai_sessions")
    op.drop_table("ai_sessions")
