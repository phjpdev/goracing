import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.api.v1 import analyses, auth, records, users
from app.config import settings
from app.core.security import hash_password
from app.database import AsyncSessionLocal, Base, engine
from app.models.record import Record  # noqa: F401 — ensure table is registered
from app.models.user import User, UserRole


async def seed_admin() -> None:
    email = os.environ.get("ADMIN_EMAIL", "Betfootball88@gmail.com")
    password = os.environ.get("ADMIN_PASSWORD", "Ted10010601")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            return
        admin = User(
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.admin,
            privacy_policy_accepted=True,
        )
        db.add(admin)
        await db.commit()


UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "records")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directories exist
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_admin()
    yield


app = FastAPI(title="Horse Racing API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(analyses.router, prefix="/api/v1")
app.include_router(records.router, prefix="/api/v1")

# Serve uploaded files statically
_uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(_uploads_dir, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory=_uploads_dir),
    name="uploads",
)


@app.get("/health")
async def health():
    return {"status": "ok"}
