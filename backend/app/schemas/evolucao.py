import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.evolucao import Impacto


class EvolucaoCreate(BaseModel):
    data_referencia: date
    titulo: str = Field(min_length=1, max_length=255)
    contexto: str = Field(min_length=1)
    situacao: str = Field(min_length=1)
    acao_realizada: str = Field(min_length=1)
    resultado: str | None = None
    evidencia: str | None = None
    responsavel_id: uuid.UUID | None = None
    impacto_percebido: Impacto | None = None
    impacto_detalhe: str | None = None
    observacoes: str | None = None
    tags: list[str] = []


class EvolucaoUpdate(BaseModel):
    data_referencia: date | None = None
    titulo: str | None = Field(default=None, min_length=1, max_length=255)
    contexto: str | None = Field(default=None, min_length=1)
    situacao: str | None = Field(default=None, min_length=1)
    acao_realizada: str | None = Field(default=None, min_length=1)
    resultado: str | None = None
    evidencia: str | None = None
    responsavel_id: uuid.UUID | None = None
    impacto_percebido: Impacto | None = None
    impacto_detalhe: str | None = None
    observacoes: str | None = None
    tags: list[str] | None = None


class EvolucaoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cliente_id: uuid.UUID
    data_referencia: date
    titulo: str
    contexto: str
    situacao: str
    acao_realizada: str
    resultado: str | None
    evidencia: str | None
    responsavel_id: uuid.UUID | None
    impacto_percebido: Impacto | None
    impacto_detalhe: str | None
    observacoes: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime
