import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import ReferralSource, UserRole


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    privacy_policy_accepted: bool
    referral_source: ReferralSource | None = None

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("privacy_policy_accepted")
    @classmethod
    def must_accept_privacy(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the privacy policy")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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
    email: str
    role: UserRole
    is_active: bool
    referral_source: str | None = None
    vip_expiry_date: datetime | None = None
    age_range: str | None = None
    price: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
