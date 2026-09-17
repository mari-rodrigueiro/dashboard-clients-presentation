import uuid

from httpx import AsyncClient

from app.api.deps import get_llm_provider
from app.main import app
from app.models.cliente import Cliente
from app.services.ai.llm_client import LLMProvider


class FakeLLMProvider(LLMProvider):
    """Captura as mensagens recebidas para inspecionar o prompt montado (grounding)."""

    def __init__(self, resposta: str = "Resposta de teste [1]."):
        self.resposta = resposta
        self.last_messages: list[dict[str, str]] | None = None

    async def complete(self, messages: list[dict[str, str]]) -> str:
        self.last_messages = messages
        return self.resposta


def _override_llm(fake: FakeLLMProvider):
    app.dependency_overrides[get_llm_provider] = lambda: fake


async def test_chat_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/ai/chat", json={"mensagem": "Oi"})
    assert response.status_code == 401


async def test_chat_grounded_on_cliente_data(authenticated_client: AsyncClient, cliente: Cliente):
    await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks",
        json={"descricao": "Risco de churn por preço", "severidade": "alta"},
    )
    fake = FakeLLMProvider("O principal risco é o preço [1].")
    _override_llm(fake)
    try:
        response = await authenticated_client.post(
            "/api/v1/ai/chat",
            json={"cliente_id": str(cliente.id), "mensagem": "Quais os riscos desse cliente?"},
        )
    finally:
        app.dependency_overrides.pop(get_llm_provider, None)

    assert response.status_code == 200
    body = response.json()
    assert body["mensagem"] == "O principal risco é o preço [1]."
    assert len(body["referencias_utilizadas"]) == 1
    assert body["referencias_utilizadas"][0]["source_type"] == "cliente"

    # a pergunta e o contexto do cliente foram enviados ao LLM, mas nada de outro cliente
    system_content = fake.last_messages[0]["content"]
    assert "Risco de churn por preço" in system_content
    assert cliente.nome in system_content


async def test_chat_without_data_says_so_in_context(authenticated_client: AsyncClient):
    fake = FakeLLMProvider("Não há dados suficientes para responder.")
    _override_llm(fake)
    try:
        response = await authenticated_client.post(
            "/api/v1/ai/chat",
            json={"cliente_id": str(uuid.uuid4()), "mensagem": "Como está esse cliente?"},
        )
    finally:
        app.dependency_overrides.pop(get_llm_provider, None)

    assert response.status_code == 200
    system_content = fake.last_messages[0]["content"]
    assert "Nenhum registro encontrado" in system_content


async def test_chat_persists_session_and_reuses_history(
    authenticated_client: AsyncClient, cliente: Cliente
):
    fake = FakeLLMProvider("Primeira resposta.")
    _override_llm(fake)
    try:
        first = await authenticated_client.post(
            "/api/v1/ai/chat", json={"cliente_id": str(cliente.id), "mensagem": "Primeira pergunta"}
        )
        session_id = first.json()["session_id"]

        fake.resposta = "Segunda resposta."
        second = await authenticated_client.post(
            "/api/v1/ai/chat",
            json={"session_id": session_id, "mensagem": "Segunda pergunta"},
        )
    finally:
        app.dependency_overrides.pop(get_llm_provider, None)

    assert second.json()["session_id"] == session_id
    # histórico da sessão foi incluído no segundo prompt
    roles_and_content = [m["content"] for m in fake.last_messages]
    assert any("Primeira pergunta" in c for c in roles_and_content)
    assert any("Primeira resposta" in c for c in roles_and_content)

    session_response = await authenticated_client.get(f"/api/v1/ai/sessions/{session_id}")
    assert session_response.status_code == 200
    assert len(session_response.json()["mensagens"]) == 4


async def test_chat_followup_without_cliente_id_keeps_session_scope(
    authenticated_client: AsyncClient, cliente: Cliente
):
    await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks", json={"descricao": "Risco de churn"}
    )
    fake = FakeLLMProvider("Primeira resposta [1].")
    _override_llm(fake)
    try:
        first = await authenticated_client.post(
            "/api/v1/ai/chat",
            json={"cliente_id": str(cliente.id), "mensagem": "Quais os riscos desse cliente?"},
        )
        session_id = first.json()["session_id"]

        # pergunta de acompanhamento não reenvia cliente_id — deve continuar escopada
        await authenticated_client.post(
            "/api/v1/ai/chat",
            json={"session_id": session_id, "mensagem": "E qual a fase dele agora?"},
        )
    finally:
        app.dependency_overrides.pop(get_llm_provider, None)

    system_content = fake.last_messages[0]["content"]
    assert "Risco de churn" in system_content
    assert "Nenhum registro encontrado" not in system_content
