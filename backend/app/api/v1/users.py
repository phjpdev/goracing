import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin, require_admin_or_subadmin
from app.core.security import hash_password
from app.models.user import ReferralSource, User, UserRole
from app.schemas.auth import CreateUserRequest, UpdateUserRequest, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_subadmin),
):
    # Subadmin can only create members
    if current_user.role == UserRole.subadmin and body.role != UserRole.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subadmins can only create member accounts",
        )

    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role,
        referral_source=body.referral_source,
        vip_expiry_date=body.vip_expiry_date,
        age_range=body.age_range,
        price=body.price,
        privacy_policy_accepted=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_subadmin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    # Subadmin only sees members
    if current_user.role == UserRole.subadmin:
        users = [u for u in users if u.role == UserRole.member]
    return users


@router.get("/analytics")
async def user_analytics(
    date: str = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_subadmin),
):
    """Return referral source stats and daily income for a given date."""
    result = await db.execute(
        select(User).where(User.role == UserRole.member)
    )
    members = result.scalars().all()

    now = datetime.now(timezone.utc)

    # Count by referral source
    sources = {}
    for src in ReferralSource:
        src_members = [m for m in members if m.referral_source == src]
        vip_members = [
            m for m in src_members
            if m.vip_expiry_date and m.vip_expiry_date > now
        ]
        sources[src.value] = {
            "total": len(src_members),
            "vip": len(vip_members),
        }

    # Daily income: sum of `price` for VIP users created on the given date
    # Convert created_at to HK time (UTC+8) to match the frontend display
    hk_tz = timezone(timedelta(hours=8))
    target_date = date or datetime.now(hk_tz).strftime("%Y-%m-%d")
    daily_income = 0.0
    for m in members:
        if m.created_at:
            created_hk = m.created_at.astimezone(hk_tz).strftime("%Y-%m-%d")
            if created_hk == target_date:
                if m.vip_expiry_date and m.vip_expiry_date > now and m.price:
                    daily_income += m.price

    return {
        "sources": sources,
        "date": target_date,
        "daily_income": daily_income,
    }


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_subadmin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Subadmin can only update members
    if current_user.role == UserRole.subadmin and user.role != UserRole.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subadmins can only update member accounts",
        )

    update_data = body.model_dump(exclude_unset=True)

    if "password" in update_data:
        pw = update_data.pop("password")
        if pw is not None:
            user.hashed_password = hash_password(pw)

    if "email" in update_data and update_data["email"] != user.email:
        existing = await db.execute(
            select(User).where(User.email == update_data["email"])
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
            )

    for key, value in update_data.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Cannot delete yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself"
        )

    await db.delete(user)
    await db.commit()
