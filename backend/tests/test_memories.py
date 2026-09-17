from httpx import AsyncClient

from app.api.deps import get_llm_provider
from app.main import app
from app.models.cliente import Cliente
from tests.test_ai_chat import FakeLLMProvider


async def test_create_and_list_memoria(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        "/api/v1/memories",
        json={
            "cliente_id": str(cliente.id),
            "titulo": "Recuperação após atualização de plataforma",
            "conteudo": "Atualizar a plataforma foi o principal fator de virada.",
            "tipo": "aprendizado",
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["criado_por"] == "user@example.com"

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/memories")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_list_memories_unknown_client_returns_404(authenticated_client: AsyncClient):
    response = await authenticated_client.get(
        "/api/v1/clients/00000000-0000-0000-0000-000000000000/memories"
    )
    assert response.status_code == 404


async def test_promoted_memoria_enters_ai_context(
    authenticated_client: AsyncClient, cliente: Cliente
):
    await authenticated_client.post(
        "/api/v1/memories",
        json={
            "cliente_id": str(cliente.id),
            "titulo": "Aprendizado sobre onboarding",
            "conteudo": "Onboarding mais curto reduziu o tempo até o primeiro valor percebido.",
        },
    )

    fake = FakeLLMProvider("Resposta baseada no aprendizado [1].")
    app.dependency_overrides[get_llm_provider] = lambda: fake
    try:
        response = await authenticated_client.post(
            "/api/v1/ai/chat",
            json={"cliente_id": str(cliente.id), "mensagem": "O que aprendemos com esse cliente?"},
        )
    finally:
        app.dependency_overrides.pop(get_llm_provider, None)

    assert response.status_code == 200
    system_content = fake.last_messages[0]["content"]
    assert "Onboarding mais curto reduziu o tempo até o primeiro valor percebido" in system_content
