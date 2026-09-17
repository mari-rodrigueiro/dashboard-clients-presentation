import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class Impacto(str, enum.Enum):
    POSITIVO = "positivo"
    NEUTRO = "neutro"
    NEGATIVO = "negativo"


class Evolucao(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.4. Tags são lidas/gravadas via `entity_tag` (entity_type="evolucao"),
    não uma FK direta — ver `app/models/tag.py` e `services/evolucao_service.py`."""

    __tablename__ = "evolucoes"

    cliente_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("clientes.id"), nullable=False)
    data_referencia: Mapped[date] = mapped_column(Date, nullable=False)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    contexto: Mapped[str] = mapped_column(Text, nullable=False)
    situacao: Mapped[str] = mapped_column(Text, nullable=False)
    acao_realizada: Mapped[str] = mapped_column(Text, nullable=False)
    resultado: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidencia: Mapped[str | None] = mapped_column(Text, nullable=True)
    responsavel_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("gps.id"), nullable=True
    )
    impacto_percebido: Mapped[Impacto | None] = mapped_column(
        Enum(
            Impacto,
            name="impacto",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=True,
    )
    impacto_detalhe: Mapped[str | None] = mapped_column(Text, nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
