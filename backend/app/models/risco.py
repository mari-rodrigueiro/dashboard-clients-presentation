import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class Severidade(str, enum.Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class StatusRisco(str, enum.Enum):
    ABERTO = "aberto"
    MITIGADO = "mitigado"
    ENCERRADO = "encerrado"


class Risco(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.6."""

    __tablename__ = "riscos"

    cliente_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("clientes.id"), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    categoria: Mapped[str | None] = mapped_column(String(255), nullable=True)
    severidade: Mapped[Severidade] = mapped_column(
        Enum(
            Severidade,
            name="severidade",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=Severidade.MEDIA,
    )
    status: Mapped[StatusRisco] = mapped_column(
        Enum(
            StatusRisco,
            name="status_risco",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=StatusRisco.ABERTO,
    )
    evidencias: Mapped[str | None] = mapped_column(Text, nullable=True)
