import uuid
from datetime import date

from pydantic import BaseModel, Field

from app.models.cliente import FaseCliente, HealthStatus
from app.models.risco import Severidade
from app.schemas.plano_sucesso import PlanoSucessoUpsert


class ImportMarkdownRequest(BaseModel):
    conteudo_md: str = Field(min_length=1)


class RiscoImportado(BaseModel):
    descricao: str
    severidade: Severidade = Severidade.MEDIA
    evidencias: str | None = None


class ClienteImportPreview(BaseModel):
    nome: str
    gp_nome_sugerido: str | None
    gp_id_sugerido: uuid.UUID | None
    fase_sugerida: FaseCliente
    health_status_sugerido: HealthStatus
    contexto: str
    data_entrada: date
    plano_sucesso: PlanoSucessoUpsert
    riscos: list[RiscoImportado]
    avisos: list[str]


class ClienteImportConfirm(BaseModel):
    nome: str = Field(min_length=1, max_length=255)
    gp_id: uuid.UUID
    fase: FaseCliente
    health_status: HealthStatus = HealthStatus.SAUDAVEL
    contexto: str
    data_entrada: date
    plano_sucesso: PlanoSucessoUpsert
    riscos: list[RiscoImportado] = []
