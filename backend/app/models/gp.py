from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class GP(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Gestor de Conta (SPECS.md §4.1) — entidade de negócio, distinta de Usuario (autenticação)."""

    __tablename__ = "gps"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    clientes: Mapped[list["Cliente"]] = relationship(back_populates="gp")  # noqa: F821
