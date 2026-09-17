from httpx import AsyncClient

from app.models.gp import GP


async def test_create_client_requires_auth(client: AsyncClient, gp: GP):
    response = await client.post(
        "/api/v1/clients",
        json={"nome": "AB Mauri", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )
    assert response.status_code == 401


async def test_create_and_get_client(authenticated_client: AsyncClient, gp: GP):
    create_response = await authenticated_client.post(
        "/api/v1/clients",
        json={"nome": "AB Mauri", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["nome"] == "AB Mauri"
    assert created["ativo"] is True
    assert created["fase"] == "onboarding"
    assert created["gp"]["id"] == str(gp.id)

    get_response = await authenticated_client.get(f"/api/v1/clients/{created['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["nome"] == "AB Mauri"


async def test_create_client_missing_nome_fails_validation(
    authenticated_client: AsyncClient, gp: GP
):
    response = await authenticated_client.post(
        "/api/v1/clients", json={"gp_id": str(gp.id), "data_entrada": "2024-01-15"}
    )
    assert response.status_code == 422


async def test_create_client_unknown_gp_returns_404(authenticated_client: AsyncClient):
    response = await authenticated_client.post(
        "/api/v1/clients",
        json={
            "nome": "Cliente Sem GP",
            "gp_id": "00000000-0000-0000-0000-000000000000",
            "data_entrada": "2024-01-15",
        },
    )
    assert response.status_code == 404


async def test_list_clients(authenticated_client: AsyncClient, gp: GP):
    await authenticated_client.post(
        "/api/v1/clients",
        json={"nome": "AB Mauri", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )
    response = await authenticated_client.get("/api/v1/clients")
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_filter_clients_by_health_status(authenticated_client: AsyncClient, gp: GP):
    await authenticated_client.post(
        "/api/v1/clients",
        json={"nome": "AB Mauri", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )
    critico = await authenticated_client.post(
        "/api/v1/clients",
        json={
            "nome": "Cliente Critico",
            "gp_id": str(gp.id),
            "data_entrada": "2024-01-15",
            "health_status": "critico",
        },
    )
    assert critico.status_code == 201

    response = await authenticated_client.get("/api/v1/clients", params={"health_status": "critico"})
    assert response.status_code == 200
    nomes = [c["nome"] for c in response.json()]
    assert nomes == ["Cliente Critico"]


async def test_filter_clients_by_name_search(authenticated_client: AsyncClient, gp: GP):
    await authenticated_client.post(
        "/api/v1/clients",
        json={"nome": "AB Mauri", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )
    await authenticated_client.post(
        "/api/v1/clients",
        json={"nome": "Outro Cliente", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )

    response = await authenticated_client.get("/api/v1/clients", params={"q": "mauri"})
    assert response.status_code == 200
    nomes = [c["nome"] for c in response.json()]
    assert nomes == ["AB Mauri"]


async def test_update_client_status(authenticated_client: AsyncClient, gp: GP):
    create_response = await authenticated_client.post(
        "/api/v1/clients",
        json={"nome": "AB Mauri", "gp_id": str(gp.id), "data_entrada": "2024-01-15"},
    )
    client_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/clients/{client_id}",
        json={"health_status": "critico", "fase": "recuperacao"},
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["health_status"] == "critico"
    assert updated["fase"] == "recuperacao"
    assert updated["nome"] == "AB Mauri"
