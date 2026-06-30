import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import ReferralSource, UserRole

_USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


class SignupRequest(BaseModel):
    username: str
    password: str
    privacy_policy_accepted: bool

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        trimmed = v.strip()
        if not _USERNAME_PATTERN.match(trimmed):
            raise ValueError(
                "Username must be 3–30 characters and contain only letters, numbers, and underscores"
            )
        return trimmed

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("privacy_policy_accepted")
    @classmethod
    def must_accept_privacy(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the privacy policy")
        return v


class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_not_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Username is required")
        return trimmed


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    referral_source: ReferralSource | None = None
    vip_expiry_date: datetime | None = None
    age_range: str | None = None
    price: float | None = None

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UpdateUserRequest(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    role: UserRole | None = None
    referral_source: ReferralSource | None = None
    vip_expiry_date: datetime | None = None
    age_range: str | None = None
    price: float | None = None

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if v is not None and len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str | None = None
    email: str | None = None
    role: UserRole
    is_active: bool
    referral_source: str | None = None
    vip_expiry_date: datetime | None = None
    age_range: str | None = None
    price: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
