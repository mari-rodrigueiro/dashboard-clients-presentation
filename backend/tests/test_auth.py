from httpx import AsyncClient

from app.models.usuario import Usuario


async def test_login_success(client: AsyncClient, usuario: Usuario):
    response = await client.post(
        "/api/v1/auth/login", json={"email": usuario.email, "password": "senha-atual-123"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == usuario.email
    assert "session" in response.cookies


async def test_login_wrong_password(client: AsyncClient, usuario: Usuario):
    response = await client.post(
        "/api/v1/auth/login", json={"email": usuario.email, "password": "errada"}
    )
    assert response.status_code == 401


async def test_protected_route_without_session_returns_401(client: AsyncClient):
    response = await client.get("/api/v1/clients")
    assert response.status_code == 401


async def test_me_with_valid_session(authenticated_client: AsyncClient, usuario: Usuario):
    response = await authenticated_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == usuario.email


async def test_change_password_success(authenticated_client: AsyncClient):
    response = await authenticated_client.put(
        "/api/v1/auth/password",
        json={"current_password": "senha-atual-123", "new_password": "nova-senha-456"},
    )
    assert response.status_code == 200

    logout = await authenticated_client.post("/api/v1/auth/logout")
    assert logout.status_code == 200

    relogin = await authenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "nova-senha-456"},
    )
    assert relogin.status_code == 200


async def test_change_password_wrong_current(authenticated_client: AsyncClient):
    response = await authenticated_client.put(
        "/api/v1/auth/password",
        json={"current_password": "errada", "new_password": "nova-senha-456"},
    )
    assert response.status_code == 403


async def test_health_does_not_require_auth(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
