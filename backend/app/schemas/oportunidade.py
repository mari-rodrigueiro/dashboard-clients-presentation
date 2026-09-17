import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.oportunidade import Potencial, StatusOportunidade


class OportunidadeCreate(BaseModel):
    descricao: str = Field(min_length=1)
    categoria: str | None = None
    potencial: Potencial = Potencial.MEDIO
    evidencias: str | None = None


class OportunidadeUpdate(BaseModel):
    descricao: str | None = Field(default=None, min_length=1)
    categoria: str | None = None
    potencial: Potencial | None = None
    status: StatusOportunidade | None = None
    evidencias: str | None = None


class OportunidadeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cliente_id: uuid.UUID
    descricao: str
    categoria: str | None
    potencial: Potencial
    status: StatusOportunidade
    evidencias: str | None
    created_at: datetime
    updated_at: datetime
