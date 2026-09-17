from app.models.ai_conversation import AiMessage, Papel
from app.services.ai.context_builder import ContextItem

SYSTEM_PROMPT = (
    "Você é um assistente de Customer Success. Responda SEMPRE com base apenas nos "
    "registros numerados na seção CONTEXTO abaixo; nunca preencha lacunas com "
    "conhecimento geral sobre a empresa ou o cliente. "
    "Quando os registros não cobrirem a pergunta, diga isso explicitamente em vez de "
    "inferir. Quando fizer uma inferência (relacionar causa e efeito não afirmado "
    "literalmente), sinalize isso como inferência, não como fato. "
    "Sempre que usar um registro, cite o número entre colchetes, ex.: [1]. "
    "Nunca invente números, datas, nomes ou resultados que não estejam nos registros."
)


def _format_contexto(items: list[ContextItem]) -> str:
    if not items:
        return "Nenhum registro encontrado para esta pergunta."
    linhas = []
    for i, item in enumerate(items, start=1):
        data_str = f", {item.data}" if item.data else ""
        linhas.append(f"[{i}] ({item.source_type}{data_str}) {item.titulo}: {item.texto}")
    return "\n".join(linhas)


def build_messages(
    context_items: list[ContextItem],
    historico: list[AiMessage],
    pergunta: str,
) -> list[dict[str, str]]:
    system_content = f"{SYSTEM_PROMPT}\n\nCONTEXTO:\n{_format_contexto(context_items)}"
    messages = [{"role": "system", "content": system_content}]
    for msg in historico:
        role = "user" if msg.papel == Papel.USER else "assistant"
        messages.append({"role": role, "content": msg.conteudo})
    messages.append({"role": "user", "content": pergunta})
    return messages
