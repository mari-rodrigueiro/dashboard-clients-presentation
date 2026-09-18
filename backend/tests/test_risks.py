from httpx import AsyncClient

from app.models.cliente import Cliente


async def test_create_and_list_risk(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks",
        json={"descricao": "Concorrente oferecendo desconto agressivo", "severidade": "alta"},
    )
    assert create_response.status_code == 201
    risco = create_response.json()
    assert risco["status"] == "aberto"
    assert risco["severidade"] == "alta"

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/risks")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_update_risk_status(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks", json={"descricao": "Risco de churn"}
    )
    risco_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/risks/{risco_id}", json={"status": "mitigado"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "mitigado"


async def test_create_risk_unknown_client_returns_404(authenticated_client: AsyncClient):
    response = await authenticated_client.post(
        "/api/v1/clients/00000000-0000-0000-0000-000000000000/risks",
        json={"descricao": "Risco qualquer"},
    )
    assert response.status_code == 404


async def test_update_risk_full_fields(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks", json={"descricao": "Risco de churn"}
    )
    risco_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/risks/{risco_id}",
        json={
            "descricao": "Risco de churn revisado",
            "categoria": "comercial",
            "severidade": "critica",
            "evidencias": "E-mail do cliente ameaçando cancelar",
        },
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["descricao"] == "Risco de churn revisado"
    assert updated["categoria"] == "comercial"
    assert updated["severidade"] == "critica"
    assert updated["evidencias"] == "E-mail do cliente ameaçando cancelar"


async def test_delete_risk(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks", json={"descricao": "Risco a remover"}
    )
    risco_id = create_response.json()["id"]

    delete_response = await authenticated_client.delete(f"/api/v1/risks/{risco_id}")
    assert delete_response.status_code == 204

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/risks")
    assert list_response.json() == []


async def test_delete_risk_nulls_linked_action(authenticated_client: AsyncClient, cliente: Cliente):
    risco_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/risks", json={"descricao": "Risco vinculado a uma ação"}
    )
    risco_id = risco_response.json()["id"]

    acao_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/actions",
        json={"descricao": "Mitigar risco", "risco_id": risco_id},
    )
    acao_id = acao_response.json()["id"]
    assert acao_response.json()["risco_id"] == risco_id

    delete_response = await authenticated_client.delete(f"/api/v1/risks/{risco_id}")
    assert delete_response.status_code == 204

    acoes_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/actions")
    acao = next(a for a in acoes_response.json() if a["id"] == acao_id)
    assert acao["risco_id"] is None


async def test_delete_risk_unknown_returns_404(authenticated_client: AsyncClient):
    response = await authenticated_client.delete(
        "/api/v1/risks/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404
