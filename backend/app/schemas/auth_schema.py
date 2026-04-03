from pydantic import BaseModel, EmailStr, Field

from app.schemas.user_schema import UserRole, UserResponse


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str | None = None


class LoginRequest(BaseModel):
    identifier: str
    password: str = Field(min_length=6, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user: UserResponse
