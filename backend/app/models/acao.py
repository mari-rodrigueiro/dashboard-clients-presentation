import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class StatusAcao(str, enum.Enum):
    PENDENTE = "pendente"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDA = "concluida"
    ATRASADA = "atrasada"
    CANCELADA = "cancelada"


class Acao(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.5. Sempre pertence a um cliente; a relação com plano/risco/oportunidade/
    evolução é opcional e não-exclusiva."""

    __tablename__ = "acoes"

    cliente_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("clientes.id"), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    responsavel_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("gps.id"), nullable=True
    )
    prazo: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[StatusAcao] = mapped_column(
        Enum(
            StatusAcao,
            name="status_acao",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=StatusAcao.PENDENTE,
    )
    plano_sucesso_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("planos_sucesso.id"), nullable=True
    )
    risco_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("riscos.id"), nullable=True
    )
    oportunidade_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("oportunidades.id"), nullable=True
    )
    evolucao_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("evolucoes.id"), nullable=True
    )
