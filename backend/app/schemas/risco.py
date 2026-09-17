import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.risco import Severidade, StatusRisco


class RiscoCreate(BaseModel):
    descricao: str = Field(min_length=1)
    categoria: str | None = None
    severidade: Severidade = Severidade.MEDIA
    evidencias: str | None = None


class RiscoUpdate(BaseModel):
    descricao: str | None = Field(default=None, min_length=1)
    categoria: str | None = None
    severidade: Severidade | None = None
    status: StatusRisco | None = None
    evidencias: str | None = None


class RiscoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cliente_id: uuid.UUID
    descricao: str
    categoria: str | None
    severidade: Severidade
    status: StatusRisco
    evidencias: str | None
    created_at: datetime
    updated_at: datetime
