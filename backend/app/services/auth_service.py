from fastapi import HTTPException, status

from app.config import settings
from app.daos.user_dao import create_user, find_user_by_username_or_email, serialize_user, update_user
from app.database.mongo import get_collection
from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.schemas.user_schema import UserRole
from app.utils.security import hash_password, verify_password


async def register_user(payload: RegisterRequest, role: UserRole = UserRole.user) -> dict:
    existing = await find_user_by_username_or_email(payload.username)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username đã tồn tại")

    existing_email = await find_user_by_username_or_email(payload.email)
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email đã tồn tại")

    created = await create_user(
        {
            "username": payload.username,
            "email": payload.email,
            "full_name": payload.full_name,
            "password_hash": hash_password(payload.password),
            "role": role.value,
            "is_active": True,
        }
    )
    return serialize_user(created)


async def authenticate_user(payload: LoginRequest) -> dict:
    user = await find_user_by_username_or_email(payload.identifier)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sai thông tin đăng nhập")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sai thông tin đăng nhập")

    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa")

    return serialize_user(user)


async def bootstrap_first_admin(payload: RegisterRequest) -> dict:
    users_collection = get_collection(settings.users_collection)

    # Check existing admin
    if await users_collection.find_one({"role": UserRole.admin.value}):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hệ thống đã có admin",
        )

    # Check existing user (username OR email)
    existing = await find_user_by_username_or_email(payload.username)

    if existing:
        if existing.get("role") == UserRole.admin.value:
            return serialize_user(existing)

        updated = await update_user(
            str(existing["_id"]),
            {"role": UserRole.admin.value, "is_active": True},
        )

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể nâng quyền admin",
            )

        return serialize_user(updated)

    # Create new admin
    return await register_user(payload=payload, role=UserRole.admin)
