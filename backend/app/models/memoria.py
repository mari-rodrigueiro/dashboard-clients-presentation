import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class TipoMemoria(str, enum.Enum):
    INSIGHT = "insight"
    PADRAO = "padrao"
    APRENDIZADO = "aprendizado"


class Memoria(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.11, §12.2. Só existe por promoção manual — nunca extração automática."""

    __tablename__ = "memorias"

    cliente_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("clientes.id"), nullable=True
    )
    origem_sessao_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("ai_sessions.id"), nullable=True
    )
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[TipoMemoria] = mapped_column(
        Enum(
            TipoMemoria,
            name="tipo_memoria",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=TipoMemoria.INSIGHT,
    )
    criado_por: Mapped[str] = mapped_column(String(255), nullable=False)
