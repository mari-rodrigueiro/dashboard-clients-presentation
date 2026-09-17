from httpx import AsyncClient

from app.models.cliente import Cliente

EVOLUCAO_PAYLOAD = {
    "data_referencia": "2024-03-01",
    "titulo": "Reunião de alinhamento",
    "contexto": "Cliente reportou lentidão na plataforma",
    "situacao": "Insatisfação crescente com performance",
    "acao_realizada": "Escalado para o time de infraestrutura",
    "tags": ["performance", "critico"],
}


async def test_create_and_list_evolution_with_tags(
    authenticated_client: AsyncClient, cliente: Cliente
):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/evolutions", json=EVOLUCAO_PAYLOAD
    )
    assert create_response.status_code == 201
    evolucao = create_response.json()
    assert evolucao["titulo"] == "Reunião de alinhamento"
    assert sorted(evolucao["tags"]) == ["critico", "performance"]

    list_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/evolutions")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_update_evolution_replaces_tags(authenticated_client: AsyncClient, cliente: Cliente):
    create_response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/evolutions", json=EVOLUCAO_PAYLOAD
    )
    evolucao_id = create_response.json()["id"]

    update_response = await authenticated_client.put(
        f"/api/v1/evolutions/{evolucao_id}",
        json={"resultado": "Corrigido em 2 dias", "tags": ["resolvido"]},
    )
    assert update_response.status_code == 200
    body = update_response.json()
    assert body["resultado"] == "Corrigido em 2 dias"
    assert body["tags"] == ["resolvido"]


async def test_create_evolution_missing_required_field_fails_validation(
    authenticated_client: AsyncClient, cliente: Cliente
):
    payload = {**EVOLUCAO_PAYLOAD}
    del payload["situacao"]
    response = await authenticated_client.post(
        f"/api/v1/clients/{cliente.id}/evolutions", json=payload
    )
    assert response.status_code == 422
