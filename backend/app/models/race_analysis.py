import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RaceAnalysis(Base):
    __tablename__ = "race_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    race_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    race_date: Mapped[str] = mapped_column(String, nullable=False)
    venue_code: Mapped[str] = mapped_column(String, nullable=False)
    analysis_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
