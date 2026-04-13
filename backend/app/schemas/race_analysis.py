import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class RaceAnalysisCreate(BaseModel):
    race_id: str
    race_date: str
    venue_code: str
    analysis_json: dict[str, Any]
    race_name_en: str | None = None
    race_name_ch: str | None = None


class RaceAnalysisResponse(BaseModel):
    id: uuid.UUID
    race_id: str
    race_date: str
    venue_code: str
    race_name_en: str | None = None
    race_name_ch: str | None = None
    analysis_json: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class RaceAnalysisTop4Update(BaseModel):
    top4: list[str]
