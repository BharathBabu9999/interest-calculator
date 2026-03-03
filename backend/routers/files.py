import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Client, ClientFile
from schemas import ClientFileRead
from auth import get_current_user


class FileDescriptionUpdate(BaseModel):
    description: Optional[str] = None

router = APIRouter(tags=["files"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

ALLOWED_MIMETYPES = {
    # Images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    # Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    # Text / data
    "text/plain", "text/csv",
}


async def get_owned_client(client_id: uuid.UUID, user: User, db: AsyncSession) -> Client:
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


async def get_owned_file(file_id: uuid.UUID, user: User, db: AsyncSession) -> ClientFile:
    result = await db.execute(
        select(ClientFile)
        .join(Client)
        .where(ClientFile.id == file_id, Client.user_id == user.id)
    )
    db_file = result.scalar_one_or_none()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    return db_file


# ── list files ────────────────────────────────────────────────────────────────

@router.get("/clients/{client_id}/files", response_model=list[ClientFileRead])
async def list_files(
    client_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_owned_client(client_id, current_user, db)
    result = await db.execute(
        select(ClientFile)
        .where(ClientFile.client_id == client_id)
        .order_by(ClientFile.created_at)
    )
    return result.scalars().all()


# ── upload ────────────────────────────────────────────────────────────────────

@router.post(
    "/clients/{client_id}/files",
    response_model=ClientFileRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_file(
    client_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_owned_client(client_id, current_user, db)

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_MIMETYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{content_type}' is not allowed. Supported: images, PDF, Word, Excel, PowerPoint, text/CSV.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds the 20 MB size limit.")

    # Store using a UUID-based filename to avoid collisions
    suffix = Path(file.filename or "file").suffix
    stored_name = f"{uuid.uuid4()}{suffix}"
    (UPLOAD_DIR / stored_name).write_bytes(content)

    db_file = ClientFile(
        client_id=client_id,
        original_filename=file.filename or stored_name,
        stored_filename=stored_name,
        mimetype=content_type,
        size=len(content),
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file


# ── download ──────────────────────────────────────────────────────────────────

@router.get("/files/{file_id}/download")
async def download_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    db_file = await get_owned_file(file_id, current_user, db)
    file_path = UPLOAD_DIR / db_file.stored_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk.")
    return FileResponse(
        path=str(file_path),
        filename=db_file.original_filename,
        media_type=db_file.mimetype,
    )


# ── update description ────────────────────────────────────────────────────────

@router.patch("/files/{file_id}", response_model=ClientFileRead)
async def update_file_description(
    file_id: uuid.UUID,
    payload: FileDescriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    db_file = await get_owned_file(file_id, current_user, db)
    db_file.description = payload.description
    await db.commit()
    await db.refresh(db_file)
    return db_file


# ── delete ────────────────────────────────────────────────────────────────────

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    db_file = await get_owned_file(file_id, current_user, db)
    file_path = UPLOAD_DIR / db_file.stored_filename
    if file_path.exists():
        file_path.unlink()
    await db.delete(db_file)
    await db.commit()
