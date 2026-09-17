import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.gp import GP


class FaseCliente(str, enum.Enum):
    ONBOARDING = "onboarding"
    ADOCAO = "adocao"
    RETENCAO = "retencao"
    EXPANSAO = "expansao"
    RECUPERACAO = "recuperacao"
    ENCERRADO = "encerrado"


class HealthStatus(str, enum.Enum):
    SAUDAVEL = "saudavel"
    ATENCAO = "atencao"
    CRITICO = "critico"


class Cliente(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """SPECS.md §4.2. `ativo=False` é soft-delete lógico — o cliente nunca é apagado."""

    __tablename__ = "clientes"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    gp_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("gps.id"), nullable=False)
    segmento: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # values_callable é necessário porque o SQLAlchemy, por padrão, persiste o `.name` do
    # enum Python (ex.: "ONBOARDING"), não o `.value" ("onboarding") — e os labels do tipo
    # ENUM criados na migration (0001_initial) são em minúsculo.
    fase: Mapped[FaseCliente] = mapped_column(
        Enum(
            FaseCliente,
            name="fase_cliente",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=FaseCliente.ONBOARDING,
    )
    health_status: Mapped[HealthStatus] = mapped_column(
        Enum(
            HealthStatus,
            name="health_status",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=HealthStatus.SAUDAVEL,
    )
    contexto: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_entrada: Mapped[date] = mapped_column(Date, nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    gp: Mapped[GP] = relationship(back_populates="clientes")
