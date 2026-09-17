import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.acao import StatusAcao


class AcaoCreate(BaseModel):
    descricao: str = Field(min_length=1)
    responsavel_id: uuid.UUID | None = None
    prazo: date | None = None
    status: StatusAcao = StatusAcao.PENDENTE
    plano_sucesso_id: uuid.UUID | None = None
    risco_id: uuid.UUID | None = None
    oportunidade_id: uuid.UUID | None = None
    evolucao_id: uuid.UUID | None = None


class AcaoUpdate(BaseModel):
    descricao: str | None = Field(default=None, min_length=1)
    responsavel_id: uuid.UUID | None = None
    prazo: date | None = None
    status: StatusAcao | None = None
    plano_sucesso_id: uuid.UUID | None = None
    risco_id: uuid.UUID | None = None
    oportunidade_id: uuid.UUID | None = None
    evolucao_id: uuid.UUID | None = None


class AcaoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cliente_id: uuid.UUID
    descricao: str
    responsavel_id: uuid.UUID | None
    prazo: date | None
    status: StatusAcao
    plano_sucesso_id: uuid.UUID | None
    risco_id: uuid.UUID | None
    oportunidade_id: uuid.UUID | None
    evolucao_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
