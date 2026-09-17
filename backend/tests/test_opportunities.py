from httpx import AsyncClient

from app.models.cliente import Cliente


async def test_create_and_list_opportunity(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities",
        json={"descricao": "Upsell de módulo de analytics", "potencial": "alto"},
    )
    assert create_response.status_code == 201
    oportunidade = create_response.json()
    assert oportunidade["status"] == "identificada"
    assert oportunidade["potencial"] == "alto"

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/opportunities")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_update_opportunity_status(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={"descricao": "Expansão de licenças"}
    )
    oportunidade_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/opportunities/{oportunidade_id}", json={"status": "concretizada"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "concretizada"


async def test_create_opportunity_missing_descricao_fails_validation(
    authenticated_client: AsyncClient, cliente: Cliente
):
    response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={}
    )
    assert response.status_code == 422
