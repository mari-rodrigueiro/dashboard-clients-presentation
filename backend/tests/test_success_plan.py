from httpx import AsyncClient

from app.models.cliente import Cliente

PLANO_PAYLOAD = {
    "situacao_inicial": "Cliente insatisfeito com a plataforma antiga",
    "expectativa_sucesso": "Migrar para a nova versão sem atrito",
    "expectativa_curto_prazo": "Concluir onboarding",
    "expectativa_medio_prazo": "Adotar 3 novos módulos",
    "expectativa_longo_prazo": "Renovação do contrato",
}


async def test_get_success_plan_not_found(authenticated_client: AsyncClient, cliente: Cliente):
    response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/success-plan")
    assert response.status_code == 404


async def test_create_and_update_success_plan_stays_single_active(
    authenticated_client: AsyncClient, cliente: Cliente
):
    create_response = await authenticated_client.put(
        f"/api/v1/clients/{cliente.id}/success-plan", json=PLANO_PAYLOAD
    )
    assert create_response.status_code == 200
    plano_id = create_response.json()["id"]
    assert create_response.json()["status"] == "ativo"

    update_response = await authenticated_client.put(
        f"/api/v1/clients/{cliente.id}/success-plan",
        json={**PLANO_PAYLOAD, "desafios": "Orçamento apertado"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["id"] == plano_id
    assert update_response.json()["desafios"] == "Orçamento apertado"

    get_response = await authenticated_client.get(f"/api/v1/clients/{cliente.id}/success-plan")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == plano_id
