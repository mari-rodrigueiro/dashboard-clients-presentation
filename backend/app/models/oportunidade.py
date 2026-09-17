import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import GUID, Base, TimestampMixin, UUIDPrimaryKeyMixin


class Potencial(str, enum.Enum):
    BAIXO = "baixo"
    MEDIO = "medio"
    ALTO = "alto"


class StatusOportunidade(str, enum.Enum):
    IDENTIFICADA = "identificada"
    EM_ANALISE = "em_analise"
    EM_EXECUCAO = "em_execucao"
    CONCRETIZADA = "concretizada"
    DESCARTADA = "descartada"


class Oportunidade(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.7."""

    __tablename__ = "oportunidades"

    cliente_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("clientes.id"), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    categoria: Mapped[str | None] = mapped_column(String(255), nullable=True)
    potencial: Mapped[Potencial] = mapped_column(
        Enum(
            Potencial,
            name="potencial",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=Potencial.MEDIO,
    )
    status: Mapped[StatusOportunidade] = mapped_column(
        Enum(
            StatusOportunidade,
            name="status_oportunidade",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=StatusOportunidade.IDENTIFICADA,
    )
    evidencias: Mapped[str | None] = mapped_column(Text, nullable=True)
