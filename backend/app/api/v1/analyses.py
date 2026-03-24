from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.race_analysis import RaceAnalysis
from app.schemas.race_analysis import RaceAnalysisCreate, RaceAnalysisResponse

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
