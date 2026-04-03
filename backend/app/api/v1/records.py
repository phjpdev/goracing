import os
import uuid
from datetime import date

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.models.record import Record
from app.models.user import User
from app.schemas.record import RecordResponse

router = APIRouter(prefix="/records", tags=["records"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads", "records")


async def _save_upload(file: UploadFile) -> str:
    """Save an uploaded file and return the relative URL path."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ""
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)
    return f"/uploads/records/{filename}"


@router.post("/", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
async def create_record(
    date: date = Form(...),
    description: str = Form(...),
    files: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    media_urls: list[str] = []
    for file in files:
        url = await _save_upload(file)
        media_urls.append(url)

    record = Record(
        date=date,
        description=description,
        media_urls=media_urls,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/", response_model=list[RecordResponse])
async def list_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Record).order_by(Record.date.desc()))
    return result.scalars().all()


@router.put("/{record_id}", response_model=RecordResponse)
async def update_record(
    record_id: uuid.UUID,
    date: date = Form(None),
    description: str = Form(None),
    files: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Record).where(Record.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    if date is not None:
        record.date = date
    if description is not None:
        record.description = description

    if files:
        new_urls: list[str] = []
        for file in files:
            url = await _save_upload(file)
            new_urls.append(url)
        record.media_urls = record.media_urls + new_urls

    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Record).where(Record.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    # Remove associated files from disk
    for url in record.media_urls:
        filepath = os.path.join(UPLOAD_DIR, os.path.basename(url))
        if os.path.exists(filepath):
            os.remove(filepath)

    await db.delete(record)
    await db.commit()
