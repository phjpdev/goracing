import uuid
from datetime import date, datetime

from pydantic import BaseModel


class RecordResponse(BaseModel):
    id: uuid.UUID
    date: date
    description: str
    media_urls: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
