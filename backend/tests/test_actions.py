from httpx import AsyncClient

from app.models.cliente import Cliente


async def test_create_and_list_action(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/actions",
        json={"descricao": "Agendar call de recuperação", "prazo": "2024-04-01"},
    )
    assert create_response.status_code == 201
    acao = create_response.json()
    assert acao["status"] == "pendente"

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/actions")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_update_action_status(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/actions", json={"descricao": "Enviar proposta"}
    )
    acao_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/actions/{acao_id}", json={"status": "concluida"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "concluida"


async def test_list_actions_requires_auth(client: AsyncClient, cliente: Cliente):
    response = await client.get(f"/api/v1/clients/{cliente.id}/actions")
    assert response.status_code == 401
