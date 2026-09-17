from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# .env vive na raiz do projeto (backend/../.env), não em backend/ — resolvido de forma
# absoluta para funcionar independente do diretório de onde uvicorn/alembic/pytest rodam.
PROJECT_ROOT_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=PROJECT_ROOT_ENV_FILE, extra="ignore")

    ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "sqlite+aiosqlite:///./cs_dashboard.db"
    DATABASE_URL_TEST: str | None = None

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    ADMIN_EMAIL: str | None = None
    ADMIN_SEED_PASSWORD: str | None = None

    CORS_ORIGINS: str = "http://localhost:5173"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
