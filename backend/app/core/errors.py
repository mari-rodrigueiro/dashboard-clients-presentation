class DomainError(Exception):
    """Base para erros de regra de negócio, mapeados para respostas HTTP em main.py."""

    status_code: int = 400

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(DomainError):
    status_code = 404

    def __init__(self, message: str = "Recurso não encontrado"):
        super().__init__(message)


class ConflictError(DomainError):
    status_code = 409

    def __init__(self, message: str = "Conflito de estado"):
        super().__init__(message)


class UnauthorizedError(DomainError):
    status_code = 401

    def __init__(self, message: str = "Não autenticado"):
        super().__init__(message)


class ForbiddenError(DomainError):
    status_code = 403

    def __init__(self, message: str = "Ação não permitida"):
        super().__init__(message)


class ConfigurationError(DomainError):
    """Recurso indisponível por falta de configuração (ex.: OPENAI_API_KEY ausente)."""

    status_code = 503

    def __init__(self, message: str = "Serviço não configurado"):
        super().__init__(message)
