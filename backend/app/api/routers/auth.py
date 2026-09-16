from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.core.config import get_settings
from app.models.usuario import Usuario
from app.schemas.auth import ChangePasswordRequest, LoginRequest, MeResponse
from app.services.auth import service as auth_service
from app.services.auth.security import COOKIE_NAME, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _set_session_cookie(response: Response, user_id) -> None:
    token = create_access_token(user_id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.ENV == "production",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.post("/login", response_model=MeResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> Usuario:
    usuario = await auth_service.authenticate(session, payload.email, payload.password)
    _set_session_cookie(response, usuario.id)
    return usuario


@router.post("/logout")
async def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=MeResponse)
async def me(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    return usuario


@router.put("/password")
async def change_password(
    payload: ChangePasswordRequest,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, bool]:
    await auth_service.change_password(
        session, usuario, payload.current_password, payload.new_password
    )
    return {"ok": True}
