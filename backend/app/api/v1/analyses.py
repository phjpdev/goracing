from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.models.race_analysis import RaceAnalysis
from app.schemas.race_analysis import (
    RaceAnalysisCreate,
    RaceAnalysisResponse,
    RaceAnalysisTop4Update,
)

router = APIRouter(prefix="/analyses", tags=["analyses"])


# ── Inline response models for /recent ──────────────────────────────────────
class RecentAnalysisItem(BaseModel):
    race_id: str
    race_name_en: str | None = None
    race_name_ch: str | None = None
    analysis_json: dict[str, Any]
    created_at: str


class RecentMeeting(BaseModel):
    race_date: str
    venue_code: str
    analyses: list[RecentAnalysisItem]


# Must be declared BEFORE /{race_id} so FastAPI doesn't match "recent" as a race_id
@router.get("/recent", response_model=list[RecentMeeting])
async def get_recent_analyses(db: AsyncSession = Depends(get_db)):
    """Return the last 3 race meetings (by race_date + venue_code) that have saved analyses."""
    # Step 1: find the 3 most recent distinct (race_date, venue_code) pairs
    stmt = (
        select(RaceAnalysis.race_date, RaceAnalysis.venue_code)
        .group_by(RaceAnalysis.race_date, RaceAnalysis.venue_code)
        .order_by(RaceAnalysis.race_date.desc())
        .limit(3)
    )
    result = await db.execute(stmt)
    meetings = result.all()

    # Step 2: fetch all analyses for each meeting
    response: list[RecentMeeting] = []
    for race_date, venue_code in meetings:
        stmt2 = (
            select(RaceAnalysis)
            .where(
                RaceAnalysis.race_date == race_date,
                RaceAnalysis.venue_code == venue_code,
            )
            .order_by(RaceAnalysis.created_at.asc())
        )
        result2 = await db.execute(stmt2)
        analyses = result2.scalars().all()
        response.append(
            RecentMeeting(
                race_date=race_date,
                venue_code=venue_code,
                analyses=[
                    RecentAnalysisItem(
                        race_id=a.race_id,
                        race_name_en=a.race_name_en,
                        race_name_ch=a.race_name_ch,
                        analysis_json=a.analysis_json or {},
                        created_at=a.created_at.isoformat(),
                    )
                    for a in analyses
                ],
            )
        )

    return response


@router.get("/{race_id}", response_model=RaceAnalysisResponse)
async def get_analysis(race_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RaceAnalysis).where(RaceAnalysis.race_id == race_id)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


@router.post("/", response_model=RaceAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(body: RaceAnalysisCreate, db: AsyncSession = Depends(get_db)):
    # Idempotent: return existing if race_id already analyzed
    result = await db.execute(
        select(RaceAnalysis).where(RaceAnalysis.race_id == body.race_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    analysis = RaceAnalysis(
        race_id=body.race_id,
        race_date=body.race_date,
        venue_code=body.venue_code,
        race_name_en=body.race_name_en,
        race_name_ch=body.race_name_ch,
        analysis_json=body.analysis_json,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis


@router.put("/{race_id}/top4", response_model=RaceAnalysisResponse)
async def update_analysis_top4(
    race_id: str,
    body: RaceAnalysisTop4Update,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    top4 = body.top4 or []
    if len(top4) != 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="top4 must contain exactly 4 horse numbers",
        )
    if len(set(top4)) != 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="top4 must not contain duplicates",
        )

    result = await db.execute(select(RaceAnalysis).where(RaceAnalysis.race_id == race_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    # NOTE: JSONB columns are not mutable-tracked by default.
    # Always work on a fresh dict and flag as modified before commit.
    payload = dict(analysis.analysis_json or {})
    picks = payload.get("topPicks")
    if not isinstance(picks, list) or len(picks) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis is missing topPicks",
        )

    # Keep original winPct/metrics per rank.
    # We only swap the horse numbers into slots 1-4 (0-3),
    # so the displayed percentages remain the original ones.
    top4_str = [str(n) for n in top4]

    index_by_no: dict[str, int] = {}
    for idx, p in enumerate(picks):
        if isinstance(p, dict) and "no" in p:
            index_by_no[str(p["no"])] = idx

    missing = [n for n in top4_str if n not in index_by_no]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid horse numbers: {', '.join(missing)}",
        )

    # Swap horse numbers so we never create duplicates.
    for slot_idx in range(min(4, len(picks))):
        p_slot = picks[slot_idx]
        if not isinstance(p_slot, dict) or "no" not in p_slot:
            continue

        desired_no = top4_str[slot_idx]
        current_no = str(p_slot["no"])
        if current_no == desired_no:
            continue

        swap_idx = index_by_no.get(desired_no)
        if swap_idx is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid horse numbers: {desired_no}",
            )

        p_swap = picks[swap_idx]
        if not isinstance(p_swap, dict) or "no" not in p_swap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Analysis has invalid topPicks entries",
            )

        # Perform swap
        p_slot["no"] = desired_no
        p_swap["no"] = current_no

        # Update indices after swap
        index_by_no[desired_no] = slot_idx
        index_by_no[current_no] = swap_idx

    payload["topPicks"] = picks
    payload["manualTop4"] = top4_str

    analysis.analysis_json = payload
    flag_modified(analysis, "analysis_json")
    await db.commit()
    await db.refresh(analysis)
    return analysis
