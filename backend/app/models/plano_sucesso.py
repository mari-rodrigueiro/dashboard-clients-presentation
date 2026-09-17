import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class StatusPlano(str, enum.Enum):
    RASCUNHO = "rascunho"
    ATIVO = "ativo"
    EM_REVISAO = "em_revisao"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"


class PlanoSucesso(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.3. Regra de aplicação (não de banco): só um `ativo` por cliente por vez —
    ver PUT /clients/{id}/success-plan em `services/plano_sucesso_service.py`."""

    __tablename__ = "planos_sucesso"

    cliente_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("clientes.id"), nullable=False)
    situacao_inicial: Mapped[str] = mapped_column(Text, nullable=False)
    expectativa_sucesso: Mapped[str] = mapped_column(Text, nullable=False)
    expectativa_curto_prazo: Mapped[str] = mapped_column(Text, nullable=False)
    expectativa_medio_prazo: Mapped[str] = mapped_column(Text, nullable=False)
    expectativa_longo_prazo: Mapped[str] = mapped_column(Text, nullable=False)
    resumo_riscos: Mapped[str | None] = mapped_column(Text, nullable=True)
    resumo_oportunidades: Mapped[str | None] = mapped_column(Text, nullable=True)
    desafios: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[StatusPlano] = mapped_column(
        Enum(
            StatusPlano,
            name="status_plano",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=StatusPlano.ATIVO,
    )
