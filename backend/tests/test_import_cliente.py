from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cliente import Cliente
from app.models.gp import GP
from app.models.risco import Severidade
from app.services.import_service import parse_plano_sucesso_markdown

SAMPLE_MD = """# Miracema Nuodex

Criado em: July 27, 2026 9:38 AM
CSM: Mariana Rodrigueiro
Fase da Jornada: Evolution / Valor & Maturidade
Gerente de Projeto Lecom: Wady Neto
Link CRM: https://app.hubspot.com/contacts/8445907/record/2-55054676/49878363703/
Status do Plano de Sucesso: Completo
Atualização do Plano: August 17, 2026

## Plano de Sucesso do Cliente

<aside>

Cliente: Miracema Nuodex

Cod. Cliente: 5313

Gerente de Projeto Lecom: Wady Neto

CSM Responsável: Mariana Rodrigueiro

Parceiro (se Houver): Plano (contrato com parceiro encerra em 21/08)

Gestor de Projeto Parceiro (se Houver):

Fases Ativas:

**[ x ] - Evolution / Valor & Maturidade**

**[ x ] - Growth / Expansão**

</aside>

<aside>

**Expectativa de Sucesso (Resumo):**

Ampliar e amadurecer o uso da Plataforma Lecom na Miracema.

Como objetivo transversal, usar a plataforma para digitalização.

</aside>

<aside>

**Expectativa para Fase do Projeto (Evolution / Valor & Maturidade)**

**Curto Prazo: Transição e autonomia (final/2026)**

Garantir continuidade após a saída da Plano.

**Médio Prazo: Maturidade e expansão**

Ampliar a utilização da plataforma.

**Longo Prazo: Escala e Hiperautomação**

Transformar a utilização da Lecom em estratégia contínua.

</aside>

<aside>

**PONTUAÇÃO EXPECTATIVA:**

## 0

</aside>

<aside>

**Mapa de Risco**

- Risco 1: Perda de conhecimento com a saída da Plano
    - Impacto: Alto
    - Ações/Tarefas: Priorizar a transição com Ana Paula, documentar processos.
        - [Tarefa](https://example.com/1)

- Risco 2: Baixa autonomia da equipe interna
    - Impacto: Alto
    - Ações/Tarefas: Envolver time de TI desde os primeiros desenvolvimentos.
        - [Tarefa](https://example.com/2)

- Risco 3: Consumo inadequado das 160h de CMC
    - Impacto: Alto
    - Ações/Tarefas: Criar uma gestão estruturada do CMC.
        - [Tarefa](https://example.com/3)

- Risco 4: Dificuldade em identificar o que é aderente à Lecom
    - Impacto: Médio
    - Ações/Tarefas: Promover capacitação e workshops.
        - [Tarefa](https://example.com/4)
</aside>

<aside>

**PONTUAÇÃO RISCO:**

## 0

</aside>
"""


def test_parse_extracts_identification_and_fase():
    parsed = parse_plano_sucesso_markdown(SAMPLE_MD)
    assert parsed["nome"] == "Miracema Nuodex"
    assert parsed["gp_nome_sugerido"] == "Wady Neto"
    assert parsed["fase_sugerida"].value == "retencao"
    assert "CSM: Mariana Rodrigueiro" in parsed["contexto"]
    # campo vazio no documento ("Gestor de Projeto Parceiro (se Houver):" sem valor,
    # seguido de linha em branco) não deve "vazar" o próximo parágrafo para o contexto.
    assert "Gestor de Projeto Parceiro" not in parsed["contexto"]
    assert "Fases Ativas" not in parsed["contexto"]


def test_parse_extracts_plano_sucesso_sections():
    parsed = parse_plano_sucesso_markdown(SAMPLE_MD)
    plano = parsed["plano_sucesso"]
    assert "Ampliar e amadurecer" in plano.expectativa_sucesso
    assert "Transição e autonomia" in plano.expectativa_curto_prazo
    assert "Maturidade e expansão" in plano.expectativa_medio_prazo
    assert "Hiperautomação" in plano.expectativa_longo_prazo


def test_parse_extracts_all_riscos_with_severidade():
    parsed = parse_plano_sucesso_markdown(SAMPLE_MD)
    riscos = parsed["riscos"]
    assert len(riscos) == 4
    assert riscos[0].descricao == "Perda de conhecimento com a saída da Plano"
    assert riscos[0].severidade == Severidade.ALTA
    assert "Ana Paula" in (riscos[0].evidencias or "")
    assert riscos[3].severidade == Severidade.MEDIA


def test_parse_minimal_markdown_does_not_crash():
    parsed = parse_plano_sucesso_markdown("# Cliente Teste\n")
    assert parsed["nome"] == "Cliente Teste"
    assert parsed["riscos"] == []
    assert parsed["fase_sugerida"].value == "onboarding"
    assert any("Fase da Jornada" in aviso for aviso in parsed["avisos"])


async def test_preview_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/v1/clients/import-md/preview", json={"conteudo_md": SAMPLE_MD}
    )
    assert response.status_code == 401


async def test_preview_suggests_existing_gp_by_name(
    authenticated_client: AsyncClient, db_session: AsyncSession, gp: GP
):
    gp.nome = "Wady Neto"
    db_session.add(gp)
    await db_session.commit()

    response = await authenticated_client.post(
        "/api/v1/clients/import-md/preview", json={"conteudo_md": SAMPLE_MD}
    )
    assert response.status_code == 200
    preview = response.json()
    assert preview["nome"] == "Miracema Nuodex"
    assert len(preview["riscos"]) == 4
    assert preview["gp_nome_sugerido"] == "Wady Neto"


async def test_confirm_creates_cliente_plano_e_riscos(authenticated_client: AsyncClient, gp: GP):
    preview_response = await authenticated_client.post(
        "/api/v1/clients/import-md/preview", json={"conteudo_md": SAMPLE_MD}
    )
    preview = preview_response.json()

    confirm_payload = {
        "nome": preview["nome"],
        "gp_id": str(gp.id),
        "fase": preview["fase_sugerida"],
        "contexto": preview["contexto"],
        "data_entrada": preview["data_entrada"],
        "plano_sucesso": preview["plano_sucesso"],
        "riscos": preview["riscos"],
    }
    confirm_response = await authenticated_client.post(
        "/api/v1/clients/import-md/confirm", json=confirm_payload
    )
    assert confirm_response.status_code == 201
    cliente = confirm_response.json()
    assert cliente["nome"] == "Miracema Nuodex"

    riscos_response = await authenticated_client.get(f"/api/v1/clients/{cliente['id']}/risks")
    assert len(riscos_response.json()) == 4

    plano_response = await authenticated_client.get(f"/api/v1/clients/{cliente['id']}/success-plan")
    assert plano_response.status_code == 200


async def test_confirm_unknown_gp_returns_404(authenticated_client: AsyncClient, cliente: Cliente):
    response = await authenticated_client.post(
        "/api/v1/clients/import-md/confirm",
        json={
            "nome": "Cliente Sem GP",
            "gp_id": "00000000-0000-0000-0000-000000000000",
            "fase": "onboarding",
            "contexto": "sem contexto",
            "data_entrada": "2026-01-01",
            "plano_sucesso": {
                "situacao_inicial": "x",
                "expectativa_sucesso": "x",
                "expectativa_curto_prazo": "x",
                "expectativa_medio_prazo": "x",
                "expectativa_longo_prazo": "x",
            },
            "riscos": [],
        },
    )
    assert response.status_code == 404
