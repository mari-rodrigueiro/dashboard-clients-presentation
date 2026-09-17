"""memoria: promocao manual de insights

Revision ID: 0004_memorias
Revises: 0003_ai_sessions
Create Date: 2026-09-17

"""

import sqlalchemy as sa

from alembic import op

revision = "0004_memorias"
down_revision = "0003_ai_sessions"
branch_labels = None
depends_on = None

GUID = sa.CHAR(36)


def upgrade() -> None:
    op.create_table(
        "memorias",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=True),
        sa.Column("origem_sessao_id", GUID, sa.ForeignKey("ai_sessions.id"), nullable=True),
        sa.Column("titulo", sa.String(length=255), nullable=False),
        sa.Column("conteudo", sa.Text(), nullable=False),
        sa.Column(
            "tipo",
            sa.Enum("insight", "padrao", "aprendizado", name="tipo_memoria"),
            nullable=False,
        ),
        sa.Column("criado_por", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_memorias_cliente_id", "memorias", ["cliente_id"])


def downgrade() -> None:
    op.drop_index("ix_memorias_cliente_id", table_name="memorias")
    op.drop_table("memorias")
