"""customer success: planos_sucesso, riscos, oportunidades, evolucoes, acoes, tags

Revision ID: 0002_customer_success
Revises: 0001_initial
Create Date: 2026-09-17

"""

import sqlalchemy as sa

from alembic import op

revision = "0002_customer_success"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

GUID = sa.CHAR(36)


def upgrade() -> None:
    op.create_table(
        "planos_sucesso",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=False),
        sa.Column("situacao_inicial", sa.Text(), nullable=False),
        sa.Column("expectativa_sucesso", sa.Text(), nullable=False),
        sa.Column("expectativa_curto_prazo", sa.Text(), nullable=False),
        sa.Column("expectativa_medio_prazo", sa.Text(), nullable=False),
        sa.Column("expectativa_longo_prazo", sa.Text(), nullable=False),
        sa.Column("resumo_riscos", sa.Text(), nullable=True),
        sa.Column("resumo_oportunidades", sa.Text(), nullable=True),
        sa.Column("desafios", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "rascunho", "ativo", "em_revisao", "concluido", "cancelado", name="status_plano"
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_planos_sucesso_cliente_id", "planos_sucesso", ["cliente_id"])

    op.create_table(
        "riscos",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("categoria", sa.String(length=255), nullable=True),
        sa.Column(
            "severidade",
            sa.Enum("baixa", "media", "alta", "critica", name="severidade"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("aberto", "mitigado", "encerrado", name="status_risco"),
            nullable=False,
        ),
        sa.Column("evidencias", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_riscos_cliente_id", "riscos", ["cliente_id"])

    op.create_table(
        "oportunidades",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("categoria", sa.String(length=255), nullable=True),
        sa.Column("potencial", sa.Enum("baixo", "medio", "alto", name="potencial"), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "identificada",
                "em_analise",
                "em_execucao",
                "concretizada",
                "descartada",
                name="status_oportunidade",
            ),
            nullable=False,
        ),
        sa.Column("evidencias", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_oportunidades_cliente_id", "oportunidades", ["cliente_id"])

    op.create_table(
        "evolucoes",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=False),
        sa.Column("data_referencia", sa.Date(), nullable=False),
        sa.Column("titulo", sa.String(length=255), nullable=False),
        sa.Column("contexto", sa.Text(), nullable=False),
        sa.Column("situacao", sa.Text(), nullable=False),
        sa.Column("acao_realizada", sa.Text(), nullable=False),
        sa.Column("resultado", sa.Text(), nullable=True),
        sa.Column("evidencia", sa.Text(), nullable=True),
        sa.Column("responsavel_id", GUID, sa.ForeignKey("gps.id"), nullable=True),
        sa.Column(
            "impacto_percebido",
            sa.Enum("positivo", "neutro", "negativo", name="impacto"),
            nullable=True,
        ),
        sa.Column("impacto_detalhe", sa.Text(), nullable=True),
        sa.Column("observacoes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_evolucoes_cliente_id", "evolucoes", ["cliente_id"])

    op.create_table(
        "acoes",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("cliente_id", GUID, sa.ForeignKey("clientes.id"), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("responsavel_id", GUID, sa.ForeignKey("gps.id"), nullable=True),
        sa.Column("prazo", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "pendente", "em_andamento", "concluida", "atrasada", "cancelada", name="status_acao"
            ),
            nullable=False,
        ),
        sa.Column("plano_sucesso_id", GUID, sa.ForeignKey("planos_sucesso.id"), nullable=True),
        sa.Column("risco_id", GUID, sa.ForeignKey("riscos.id"), nullable=True),
        sa.Column("oportunidade_id", GUID, sa.ForeignKey("oportunidades.id"), nullable=True),
        sa.Column("evolucao_id", GUID, sa.ForeignKey("evolucoes.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_acoes_cliente_id", "acoes", ["cliente_id"])

    op.create_table(
        "tags",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("nome", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_tags_nome", "tags", ["nome"], unique=True)

    op.create_table(
        "entity_tag",
        sa.Column("id", GUID, primary_key=True),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", GUID, nullable=False),
        sa.Column("tag_id", GUID, sa.ForeignKey("tags.id"), nullable=False),
    )
    op.create_index("ix_entity_tag_entity", "entity_tag", ["entity_type", "entity_id"])


def downgrade() -> None:
    op.drop_index("ix_entity_tag_entity", table_name="entity_tag")
    op.drop_table("entity_tag")
    op.drop_index("ix_tags_nome", table_name="tags")
    op.drop_table("tags")
    op.drop_index("ix_acoes_cliente_id", table_name="acoes")
    op.drop_table("acoes")
    op.drop_index("ix_evolucoes_cliente_id", table_name="evolucoes")
    op.drop_table("evolucoes")
    op.drop_index("ix_oportunidades_cliente_id", table_name="oportunidades")
    op.drop_table("oportunidades")
    op.drop_index("ix_riscos_cliente_id", table_name="riscos")
    op.drop_table("riscos")
    op.drop_index("ix_planos_sucesso_cliente_id", table_name="planos_sucesso")
    op.drop_table("planos_sucesso")
