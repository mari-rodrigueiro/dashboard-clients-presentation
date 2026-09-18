from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.cliente import ClienteRead
from app.schemas.import_cliente import (
    ClienteImportConfirm,
    ClienteImportPreview,
    ImportMarkdownRequest,
)
from app.services import import_service

router = APIRouter(
    prefix="/clients/import-md", tags=["import"], dependencies=[Depends(get_current_user)]
)


@router.post("/preview", response_model=ClienteImportPreview)
async def preview_import(
    payload: ImportMarkdownRequest, session: AsyncSession = Depends(get_session)
):
    return await import_service.build_preview(session, payload.conteudo_md)


@router.post("/confirm", response_model=ClienteRead, status_code=201)
async def confirm_import(
    payload: ClienteImportConfirm, session: AsyncSession = Depends(get_session)
):
    return await import_service.confirm_import(session, payload)
