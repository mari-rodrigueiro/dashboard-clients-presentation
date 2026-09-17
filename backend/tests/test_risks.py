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
