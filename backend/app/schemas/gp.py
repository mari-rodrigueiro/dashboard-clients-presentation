import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GPCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=255)
    email: str | None = None


class GPRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str
    email: str | None
    created_at: datetime
