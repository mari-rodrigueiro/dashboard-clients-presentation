"""Importação de cliente a partir do Markdown exportado do Notion (padrão do template
"Plano de Sucesso do Cliente" da Lecom, ver SPECS.md §9 e §21 D20).

Fluxo em duas etapas — nunca salva direto do parser (ver `api/routers/import_cliente.py`):
1. `build_preview` faz o parsing determinístico (sem IA) e devolve uma prévia editável.
2. `confirm_import` recebe os dados (possivelmente corrigidos pelo usuário) e cria os
   registros reais reaproveitando `cliente_service`/`plano_sucesso_service`/`risco_service`.

O parser é deliberadamente best-effort: nunca lança exceção por seção ausente/inesperada —
sinaliza a lacuna em `avisos` e deixa o valor num default razoável para revisão humana,
porque o template do Notion pode variar entre exportações.
"""

import re
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cliente import Cliente, FaseCliente, HealthStatus
from app.models.gp import GP
from app.models.risco import Severidade
from app.schemas.cliente import ClienteCreate
from app.schemas.import_cliente import (
    ClienteImportConfirm,
    ClienteImportPreview,
    RiscoImportado,
)
from app.schemas.plano_sucesso import PlanoSucessoUpsert
from app.schemas.risco import RiscoCreate
from app.services import cliente_service, plano_sucesso_service, risco_service

_ASIDE_RE = re.compile(r"<aside>(.*?)</aside>", re.DOTALL)
_LINK_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")
_BOLD_HEADING_RE = re.compile(r"^\*\*(.+?)\*\*\s*$", re.MULTILINE)

_FASE_KEYWORDS: list[tuple[str, FaseCliente]] = [
    ("onboarding", FaseCliente.ONBOARDING),
    ("adocao", FaseCliente.ADOCAO),
    ("adoção", FaseCliente.ADOCAO),
    ("adoption", FaseCliente.ADOCAO),
    ("growth", FaseCliente.EXPANSAO),
    ("expansao", FaseCliente.EXPANSAO),
    ("expansão", FaseCliente.EXPANSAO),
    ("recupera", FaseCliente.RECUPERACAO),
    ("recovery", FaseCliente.RECUPERACAO),
    ("encerr", FaseCliente.ENCERRADO),
    ("evolution", FaseCliente.RETENCAO),
    ("maturidade", FaseCliente.RETENCAO),
    ("retencao", FaseCliente.RETENCAO),
    ("retenção", FaseCliente.RETENCAO),
]

_SEVERIDADE_KEYWORDS: list[tuple[str, Severidade]] = [
    ("critic", Severidade.CRITICA),
    ("alto", Severidade.ALTA),
    ("alta", Severidade.ALTA),
    ("medio", Severidade.MEDIA),
    ("médio", Severidade.MEDIA),
    ("media", Severidade.MEDIA),
    ("baixo", Severidade.BAIXA),
    ("baixa", Severidade.BAIXA),
]


def _clean(text: str | None) -> str:
    if not text:
        return ""
    text = _LINK_RE.sub(r"\1", text)
    lines = [line.strip(" \t-") for line in text.strip().splitlines()]
    return "\n".join(line for line in lines if line).strip()


def _extract_asides(md: str) -> list[str]:
    return [m.strip() for m in _ASIDE_RE.findall(md)]


def _extract_top_field(md: str, label: str) -> str | None:
    # [ \t]* (não \s*) depois dos dois-pontos: \s também casa quebra de linha, o que faria
    # um campo vazio "engolir" a linha em branco seguinte e capturar o próximo parágrafo.
    match = re.search(rf"^{re.escape(label)}:[ \t]*(.+)$", md, re.MULTILINE)
    return match.group(1).strip() or None if match else None


def _extract_aside_field(aside: str, label: str) -> str | None:
    match = re.search(rf"^{re.escape(label)}:[ \t]*(.*)$", aside, re.MULTILINE)
    if not match:
        return None
    value = match.group(1).strip()
    return value or None


def _find_aside_containing(asides: list[str], *needles: str) -> str | None:
    for aside in asides:
        if all(needle in aside for needle in needles):
            return aside
    return None


def _map_fase(fase_texto: str | None) -> tuple[FaseCliente, str | None]:
    if fase_texto:
        lowered = fase_texto.lower()
        for keyword, fase in _FASE_KEYWORDS:
            if keyword in lowered:
                return fase, None
        return (
            FaseCliente.ONBOARDING,
            f"Fase '{fase_texto}' não corresponde a nenhuma fase conhecida; "
            "usando 'onboarding' como padrão — revise antes de salvar.",
        )
    return (
        FaseCliente.ONBOARDING,
        "Fase da Jornada não encontrada no documento; usando 'onboarding'.",
    )


def _map_severidade(impacto_texto: str | None) -> Severidade:
    if impacto_texto:
        lowered = impacto_texto.lower()
        for keyword, severidade in _SEVERIDADE_KEYWORDS:
            if keyword in lowered:
                return severidade
    return Severidade.MEDIA


def _extract_bold_section(aside: str, heading_substring: str) -> str:
    """Captura o texto entre um cabeçalho em negrito (`**Curto Prazo: ...**`) e o
    próximo cabeçalho em negrito (ou o fim do bloco)."""
    headings = list(_BOLD_HEADING_RE.finditer(aside))
    for idx, heading in enumerate(headings):
        if heading_substring.lower() in heading.group(1).lower():
            start = heading.start()
            end = headings[idx + 1].start() if idx + 1 < len(headings) else len(aside)
            return _clean(aside[start:end])
    return ""


def _extract_expectativa_sucesso(asides: list[str]) -> str:
    aside = _find_aside_containing(asides, "Expectativa de Sucesso")
    if not aside:
        return ""
    body = re.sub(r"^\*\*Expectativa de Sucesso.*?\*\*\s*", "", aside.strip())
    return _clean(body)


def _extract_pontuacao(asides: list[str], label: str) -> str | None:
    aside = _find_aside_containing(asides, label)
    if not aside:
        return None
    match = re.search(r"##\s*([0-9]+)", aside)
    return match.group(1) if match else None


def _extract_riscos(asides: list[str]) -> list[RiscoImportado]:
    aside = _find_aside_containing(asides, "Mapa de Risco")
    if not aside:
        return []

    blocos = re.split(r"^-\s*Risco\s*\d+\s*:\s*", aside, flags=re.MULTILINE)[1:]
    riscos: list[RiscoImportado] = []
    for bloco in blocos:
        descricao_match = re.match(r"^(.+)$", bloco.strip(), re.MULTILINE)
        descricao = descricao_match.group(1).strip() if descricao_match else bloco.strip()

        impacto_match = re.search(r"Impacto:\s*(.+)", bloco)
        impacto = impacto_match.group(1).strip() if impacto_match else None

        acoes_match = re.search(
            r"Ações/Tarefas:\s*(.+?)(?=\n\s*-\s*Risco\s*\d+\s*:|\Z)", bloco, re.DOTALL
        )
        evidencias = _clean(acoes_match.group(1)) if acoes_match else None

        riscos.append(
            RiscoImportado(
                descricao=descricao,
                severidade=_map_severidade(impacto),
                evidencias=evidencias or None,
            )
        )
    return riscos


def _extract_valores_gerados(asides: list[str]) -> str:
    aside = _find_aside_containing(asides, "Valores Gerados")
    if not aside:
        return ""
    body = re.sub(r"^\*\*Valores Gerados\*\*\s*", "", aside.strip())
    return _clean(body)


def _parse_data_criacao(texto: str | None) -> date | None:
    if not texto:
        return None
    texto = re.sub(r"\s+\d{1,2}:\d{2}\s*(AM|PM)?\s*$", "", texto.strip(), flags=re.IGNORECASE)
    for fmt in ("%B %d, %Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(texto, fmt).date()
        except ValueError:
            continue
    return None


def parse_plano_sucesso_markdown(conteudo_md: str) -> dict:
    """Parsing puro (sem I/O, sem sessão de banco) — o resultado ainda precisa ser
    combinado com a busca de GP existente em `build_preview`."""
    avisos: list[str] = []
    asides = _extract_asides(conteudo_md)

    aside_identificacao = _find_aside_containing(asides, "Cliente:", "Cod. Cliente") or (
        asides[0] if asides else ""
    )

    titulo_match = re.search(r"^#\s+(.+)$", conteudo_md, re.MULTILINE)
    nome = _extract_aside_field(aside_identificacao, "Cliente") or (
        titulo_match.group(1).strip() if titulo_match else "Cliente importado"
    )

    gerente_lecom = _extract_aside_field(
        aside_identificacao, "Gerente de Projeto Lecom"
    ) or _extract_top_field(conteudo_md, "Gerente de Projeto Lecom")
    if not gerente_lecom:
        avisos.append("Campo Gerente de Projeto Lecom não encontrado; selecione o GP manualmente.")

    fase_texto = _extract_top_field(conteudo_md, "Fase da Jornada")
    fase, aviso_fase = _map_fase(fase_texto)
    if aviso_fase:
        avisos.append(aviso_fase)

    csm = _extract_aside_field(aside_identificacao, "CSM Responsável") or _extract_top_field(
        conteudo_md, "CSM"
    )
    cod_cliente = _extract_aside_field(aside_identificacao, "Cod. Cliente")
    link_crm = _extract_top_field(conteudo_md, "Link CRM")
    parceiro = _extract_aside_field(aside_identificacao, "Parceiro (se Houver)")
    gestor_parceiro = _extract_aside_field(
        aside_identificacao, "Gestor de Projeto Parceiro (se Houver)"
    )
    status_plano = _extract_top_field(conteudo_md, "Status do Plano de Sucesso")
    atualizacao_plano = _extract_top_field(conteudo_md, "Atualização do Plano")

    pontuacao_expectativa = _extract_pontuacao(asides, "PONTUAÇÃO EXPECTATIVA")
    pontuacao_risco = _extract_pontuacao(asides, "PONTUAÇÃO RISCO")
    pontuacao_valor = _extract_pontuacao(asides, "PONTUAÇÃO VALOR PERCEBIDO")
    valores_gerados = _extract_valores_gerados(asides)

    metadados_linhas = [
        f"Cod. Cliente: {cod_cliente}" if cod_cliente else None,
        f"CSM: {csm}" if csm else None,
        f"Link CRM: {link_crm}" if link_crm else None,
        f"Parceiro: {parceiro}" if parceiro else None,
        f"Gestor de Projeto Parceiro: {gestor_parceiro}" if gestor_parceiro else None,
        f"Status do Plano de Sucesso: {status_plano}" if status_plano else None,
        f"Atualização do Plano: {atualizacao_plano}" if atualizacao_plano else None,
        f"Pontuação Expectativa: {pontuacao_expectativa}" if pontuacao_expectativa else None,
        f"Pontuação Risco: {pontuacao_risco}" if pontuacao_risco else None,
        f"Pontuação Valor Percebido: {pontuacao_valor}" if pontuacao_valor else None,
        f"Valores Gerados: {valores_gerados}" if valores_gerados else None,
    ]
    contexto = "\n".join(linha for linha in metadados_linhas if linha)
    if not contexto:
        contexto = "Importado via Markdown — sem metadados adicionais identificados."

    expectativa_sucesso = _extract_expectativa_sucesso(asides)
    if not expectativa_sucesso:
        avisos.append("Seção 'Expectativa de Sucesso' não encontrada; campo ficou vazio.")

    aside_expectativa_fase = _find_aside_containing(asides, "Expectativa para Fase do Projeto")
    curto = _extract_bold_section(aside_expectativa_fase or "", "Curto Prazo")
    medio = _extract_bold_section(aside_expectativa_fase or "", "Médio Prazo")
    longo = _extract_bold_section(aside_expectativa_fase or "", "Longo Prazo")
    secoes_prazo = (("curto prazo", curto), ("médio prazo", medio), ("longo prazo", longo))
    for nome_secao, valor in secoes_prazo:
        if not valor:
            avisos.append(f"Expectativa de {nome_secao} não encontrada; campo ficou vazio.")

    avisos.append(
        "Situação inicial não existe como campo separado neste template — preenchida com "
        "o resumo de Expectativa de Sucesso; revise antes de salvar."
    )

    riscos = _extract_riscos(asides)
    if not riscos:
        avisos.append("Nenhum risco identificado na seção 'Mapa de Risco'.")

    data_entrada = _parse_data_criacao(_extract_top_field(conteudo_md, "Criado em")) or date.today()

    plano_sucesso = PlanoSucessoUpsert(
        situacao_inicial=expectativa_sucesso or "Não informado no documento importado.",
        expectativa_sucesso=expectativa_sucesso or "Não informado no documento importado.",
        expectativa_curto_prazo=curto or "Não informado no documento importado.",
        expectativa_medio_prazo=medio or "Não informado no documento importado.",
        expectativa_longo_prazo=longo or "Não informado no documento importado.",
        resumo_riscos=None,
        resumo_oportunidades=None,
        desafios=None,
    )

    return {
        "nome": nome,
        "gp_nome_sugerido": gerente_lecom,
        "fase_sugerida": fase,
        "health_status_sugerido": HealthStatus.SAUDAVEL,
        "contexto": contexto,
        "data_entrada": data_entrada,
        "plano_sucesso": plano_sucesso,
        "riscos": riscos,
        "avisos": avisos,
    }


async def _buscar_gp_por_nome(session: AsyncSession, nome: str | None) -> GP | None:
    if not nome:
        return None
    result = await session.execute(select(GP).where(GP.nome.ilike(nome.strip())))
    return result.scalar_one_or_none()


async def build_preview(session: AsyncSession, conteudo_md: str) -> ClienteImportPreview:
    parsed = parse_plano_sucesso_markdown(conteudo_md)
    gp = await _buscar_gp_por_nome(session, parsed["gp_nome_sugerido"])
    return ClienteImportPreview(
        nome=parsed["nome"],
        gp_nome_sugerido=parsed["gp_nome_sugerido"],
        gp_id_sugerido=gp.id if gp else None,
        fase_sugerida=parsed["fase_sugerida"],
        health_status_sugerido=parsed["health_status_sugerido"],
        contexto=parsed["contexto"],
        data_entrada=parsed["data_entrada"],
        plano_sucesso=parsed["plano_sucesso"],
        riscos=parsed["riscos"],
        avisos=parsed["avisos"],
    )


async def confirm_import(session: AsyncSession, data: ClienteImportConfirm) -> Cliente:
    cliente = await cliente_service.create_cliente(
        session,
        ClienteCreate(
            nome=data.nome,
            gp_id=data.gp_id,
            fase=data.fase,
            health_status=data.health_status,
            contexto=data.contexto,
            data_entrada=data.data_entrada,
        ),
    )
    await plano_sucesso_service.upsert_plano(session, cliente.id, data.plano_sucesso)
    for risco in data.riscos:
        await risco_service.create_risco(
            session,
            cliente.id,
            RiscoCreate(
                descricao=risco.descricao,
                severidade=risco.severidade,
                evidencias=risco.evidencias,
            ),
        )
    return await cliente_service.get_cliente(session, cliente.id)
