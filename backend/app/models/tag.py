import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class Tag(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.8."""

    __tablename__ = "tags"

    nome: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)


class EntityTag(Base):
    """Associação polimórfica leve (SPECS.md §4.8, decisão D6 em §21) — cruza qualquer
    entidade (`entity_type` + `entity_id`) com uma Tag, sem FK de banco para `entity_id`
    já que ele aponta para tabelas diferentes dependendo de `entity_type`."""

    __tablename__ = "entity_tag"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(GUID(), nullable=False)
    tag_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("tags.id"), nullable=False)
