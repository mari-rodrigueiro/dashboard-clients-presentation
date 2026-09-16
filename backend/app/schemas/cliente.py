import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.cliente import FaseCliente, HealthStatus
from app.schemas.gp import GPRead


class ClienteCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=255)
    gp_id: uuid.UUID
    segmento: str | None = None
    fase: FaseCliente = FaseCliente.ONBOARDING
    health_status: HealthStatus = HealthStatus.SAUDAVEL
    contexto: str | None = None
    data_entrada: date


class ClienteUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=255)
    gp_id: uuid.UUID | None = None
    segmento: str | None = None
    fase: FaseCliente | None = None
    health_status: HealthStatus | None = None
    contexto: str | None = None
    data_entrada: date | None = None
    ativo: bool | None = None


class ClienteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str
    gp: GPRead
    segmento: str | None
    fase: FaseCliente
    health_status: HealthStatus
    contexto: str | None
    data_entrada: date
    ativo: bool
    created_at: datetime
    updated_at: datetime
