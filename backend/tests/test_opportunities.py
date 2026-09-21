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


async def test_update_opportunity_full_fields(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={"descricao": "Upsell"}
    )
    oportunidade_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/opportunities/{oportunidade_id}",
        json={"descricao": "Upsell revisado", "categoria": "expansao", "potencial": "alto"},
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["descricao"] == "Upsell revisado"
    assert updated["categoria"] == "expansao"
    assert updated["potencial"] == "alto"


async def test_delete_opportunity(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={"descricao": "Oportunidade a remover"}
    )
    oportunidade_id = create_response.json()["id"]

    delete_response = await authenticated_client.delete(f"/api/v1/opportunities/{oportunidade_id}")
    assert delete_response.status_code == 204

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/opportunities")
    assert list_response.json() == []


async def test_delete_opportunity_unknown_returns_404(authenticated_client: AsyncClient):
    response = await authenticated_client.delete(
        "/api/v1/opportunities/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404


async def test_list_opportunities_carteira_returns_active_with_client_embedded(
    authenticated_client: AsyncClient, cliente: Cliente
):
    ativa_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities",
        json={"descricao": "Upsell de módulo de analytics", "potencial": "alto"},
    )
    descartada_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={"descricao": "Oportunidade descartada"}
    )
    descartada_id = descartada_response.json()["id"]
    await authenticated_client.put(
        f"/api/v1/opportunities/{descartada_id}", json={"status": "descartada"}
    )

    response = await authenticated_client.get("/api/v1/opportunities")
    assert response.status_code == 200
    oportunidades = response.json()
    assert len(oportunidades) == 1
    assert oportunidades[0]["id"] == ativa_response.json()["id"]
    assert oportunidades[0]["cliente_id"] == str(cliente.id)
    assert oportunidades[0]["cliente_nome"] == cliente.nome
    assert oportunidades[0]["cliente_fase"] == cliente.fase.value


async def test_list_opportunities_carteira_excludes_inactive_client(
    authenticated_client: AsyncClient, cliente: Cliente
):
    await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={"descricao": "Oportunidade qualquer"}
    )
    await authenticated_client.put(f"/api/v1/clients/{cliente.id}", json={"ativo": False})

    response = await authenticated_client.get("/api/v1/opportunities")
    assert response.status_code == 200
    assert response.json() == []
