import os
import uuid
from collections.abc import AsyncGenerator
from datetime import date

os.environ["DATABASE_URL"] = os.environ.get("DATABASE_URL_TEST", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key")
os.environ["ADMIN_EMAIL"] = ""
os.environ["ADMIN_SEED_PASSWORD"] = ""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.api.deps import get_session
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.cliente import Cliente
from app.models.gp import GP
from app.models.usuario import Usuario
from app.services.auth.security import hash_password

settings_url = os.environ["DATABASE_URL"]
test_engine = create_async_engine(
    settings_url,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = async_sessionmaker(bind=test_engine, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
async def _prepare_schema():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await test_engine.dispose()


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()
        for table in reversed(Base.metadata.sorted_tables):
            await session.execute(table.delete())
        await session.commit()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_session] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def usuario(db_session: AsyncSession) -> Usuario:
    user = Usuario(email="user@example.com", password_hash=hash_password("senha-atual-123"))
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def authenticated_client(client: AsyncClient, usuario: Usuario) -> AsyncClient:
    response = await client.post(
        "/api/v1/auth/login", json={"email": usuario.email, "password": "senha-atual-123"}
    )
    assert response.status_code == 200
    return client


@pytest.fixture
async def gp(db_session: AsyncSession) -> GP:
    gp = GP(nome="Renan Rescia", email=None)
    db_session.add(gp)
    await db_session.commit()
    await db_session.refresh(gp)
    return gp


@pytest.fixture
async def cliente(db_session: AsyncSession, gp: GP) -> Cliente:
    cliente = Cliente(nome="AB Mauri", gp_id=gp.id, data_entrada=date(2024, 1, 15))
    db_session.add(cliente)
    await db_session.commit()
    await db_session.refresh(cliente)
    return cliente


def new_uuid() -> str:
    return str(uuid.uuid4())
