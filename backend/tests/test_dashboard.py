from httpx import AsyncClient

from app.models.cliente import Cliente


async def test_dashboard_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/dashboard")
    assert response.status_code == 401


async def test_dashboard_reflects_real_data(authenticated_client: AsyncClient, cliente: Cliente):
    await authenticated_client.put(
        f"/api/v1/clients/{cliente.id}", json={"health_status": "critico"}
    )
    await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/opportunities", json={"descricao": "Upsell"}
    )
    await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/evolutions",
        json={
            "data_referencia": "2024-03-01",
            "titulo": "Recuperação bem-sucedida",
            "contexto": "Contexto",
            "situacao": "Situação",
            "acao_realizada": "Ação",
            "impacto_percebido": "positivo",
        },
    )

    response = await authenticated_client.get("/api/v1/dashboard")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_clientes"] == 1
    assert "clientes_em_risco" not in stats
    assert stats["clientes_por_saude"] == [{"health_status": "critico", "total": 1}]
    assert stats["oportunidades_ativas"] == 1
    assert len(stats["ultimas_evolucoes"]) == 1
    assert len(stats["cases_destaque"]) == 1
    assert stats["cases_destaque"][0]["cliente_nome"] == "AB Mauri"
