from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.models.race_analysis import RaceAnalysis
from app.schemas.race_analysis import (
    RaceAnalysisCreate,
    RaceAnalysisResponse,
    RaceAnalysisTop4Update,
)

router = APIRouter(prefix="/analyses", tags=["analyses"])


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

    payload = analysis.analysis_json or {}
    picks = payload.get("topPicks")
    if not isinstance(picks, list) or len(picks) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis is missing topPicks",
        )

    # Map pick by horse number (as string)
    by_no: dict[str, dict] = {}
    for p in picks:
        if isinstance(p, dict) and "no" in p:
            by_no[str(p["no"])] = p

    missing = [n for n in top4 if str(n) not in by_no]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid horse numbers: {', '.join(missing)}",
        )

    top4_str = [str(n) for n in top4]
    reordered = [by_no[n] for n in top4_str]

    # Keep remaining picks in their original order
    for p in picks:
        if not isinstance(p, dict) or "no" not in p:
            continue
        n = str(p["no"])
        if n in top4_str:
            continue
        reordered.append(p)

    payload["topPicks"] = reordered
    payload["manualTop4"] = top4_str

    # Align overallWinPct with the new top pick, if possible
    try:
        wp = str(reordered[0].get("winPct", "")).replace("%", "").strip()
        payload["overallWinPct"] = float(wp)
    except Exception:
        # Leave as-is if parsing fails
        pass

    analysis.analysis_json = payload
    await db.commit()
    await db.refresh(analysis)
    return analysis
