"""initial schema: usuarios, gps, clientes

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-16

"""

import sqlalchemy as sa

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

GUID = sa.CHAR(36)


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)

    op.create_table(
        "gps",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    fase_cliente = sa.Enum(
        "onboarding",
        "adocao",
        "retencao",
        "expansao",
        "recuperacao",
        "encerrado",
        name="fase_cliente",
    )
    health_status = sa.Enum("saudavel", "atencao", "critico", name="health_status")

    op.create_table(
        "clientes",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("gp_id", GUID, sa.ForeignKey("gps.id"), nullable=False),
        sa.Column("segmento", sa.String(length=255), nullable=True),
        sa.Column("fase", fase_cliente, nullable=False),
        sa.Column("health_status", health_status, nullable=False),
        sa.Column("contexto", sa.Text(), nullable=True),
        sa.Column("data_entrada", sa.Date(), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_clientes_gp_id", "clientes", ["gp_id"])


def downgrade() -> None:
    op.drop_index("ix_clientes_gp_id", table_name="clientes")
    op.drop_table("clientes")
    op.drop_table("gps")
    op.drop_index("ix_usuarios_email", table_name="usuarios")
    op.drop_table("usuarios")
