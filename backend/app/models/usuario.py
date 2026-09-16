from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Usuario(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Credencial de acesso ao sistema. Uso local/individual: espera-se uma única linha
    (ver SPECS.md §4.13 e §15.1) — não há papéis/permissões nesta fase."""

    __tablename__ = "usuarios"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
