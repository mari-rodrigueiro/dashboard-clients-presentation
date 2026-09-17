import uuid
from datetime import UTC, datetime

from sqlalchemy import CHAR, DateTime, TypeDecorator
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(UTC)


class GUID(TypeDecorator):
    """UUID armazenado como CHAR(36) — portátil entre bancos (usado com SQLite).
    Converte para/de `uuid.UUID` no nível Python; ORM/Pydantic continuam vendo UUID."""

    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value: uuid.UUID | str | None, dialect) -> str | None:
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value: str | None, dialect) -> uuid.UUID | None:
        if value is None:
            return None
        return uuid.UUID(value)


class Base(DeclarativeBase):
    pass


class UUIDPrimaryKeyMixin:
    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
