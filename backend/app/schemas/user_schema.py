from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    admin = "admin"
    user = "user"


class UserCreateRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str | None = None
    role: UserRole = UserRole.user


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str | None = None
    role: UserRole
    is_active: bool = True
    created_at: datetime | None = None
