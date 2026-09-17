from httpx import AsyncClient


async def test_create_and_list_gp(authenticated_client: AsyncClient):
    create_response = await authenticated_client.post("/api/v1/gps", json={"nome": "Renan Rescia"})
    assert create_response.status_code == 201
    assert create_response.json()["nome"] == "Renan Rescia"

    list_response = await authenticated_client.get("/api/v1/gps")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_list_gp_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/gps")
    assert response.status_code == 401
