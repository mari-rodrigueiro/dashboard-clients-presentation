import enum
import uuid

from sqlalchemy import JSON, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class Papel(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"


class AiSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.10. Memória de curto prazo = histórico desta sessão (ver §12.1)."""

    __tablename__ = "ai_sessions"

    cliente_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("clientes.id"), nullable=True
    )
    usuario: Mapped[str] = mapped_column(String(255), nullable=False)


class AiMessage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.10."""

    __tablename__ = "ai_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("ai_sessions.id"), nullable=False
    )
    papel: Mapped[Papel] = mapped_column(
        Enum(Papel, name="papel", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
    )
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    referencias_utilizadas: Mapped[list | None] = mapped_column(JSON, nullable=True)
