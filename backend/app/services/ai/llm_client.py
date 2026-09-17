from abc import ABC, abstractmethod

import httpx

from app.core.config import get_settings
from app.core.errors import ConfigurationError


class LLMProvider(ABC):
    """SPECS.md §11.1. Abstrai o provedor de geração — trocar de provedor é uma mudança
    localizada a uma nova implementação desta interface, não uma reescrita do chat."""

    @abstractmethod
    async def complete(self, messages: list[dict[str, str]]) -> str: ...


class OpenAILLMProvider(LLMProvider):
    """Chama a API de Chat Completions da OpenAI via `httpx` (já é dependência do projeto —
    evita adicionar o SDK oficial só para uma chamada REST simples)."""

    API_URL = "https://api.openai.com/v1/chat/completions"

    async def complete(self, messages: list[dict[str, str]]) -> str:
        settings = get_settings()
        if not settings.OPENAI_API_KEY:
            raise ConfigurationError(
                "OPENAI_API_KEY não configurada — preencha no .env para usar o chat de IA"
            )
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self.API_URL,
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": messages,
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
