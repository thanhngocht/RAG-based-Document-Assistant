from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth_schema import LoginRequest, LoginResponse, RegisterRequest
from app.services.auth_service import authenticate_user, bootstrap_first_admin, register_user
from app.utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse)
async def register(payload: RegisterRequest):
    user = await register_user(payload)
    token = create_access_token(user["id"], user["role"])
    return {"access_token": token, "role": user["role"], "user": user}


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    user = await authenticate_user(payload)
    token = create_access_token(user["id"], user["role"])
    return {"access_token": token, "role": user["role"], "user": user}


@router.post("/token")
async def token(form_data: OAuth2PasswordRequestForm = Depends()):
    payload = LoginRequest(identifier=form_data.username, password=form_data.password)
    user = await authenticate_user(payload)
    token = create_access_token(user["id"], user["role"])
    return {"access_token": token, "token_type": "bearer"}


@router.post("/bootstrap-admin", response_model=LoginResponse)
async def bootstrap_admin(payload: RegisterRequest):
    user = await bootstrap_first_admin(payload)
    token = create_access_token(user["id"], user["role"])
    return {"access_token": token, "role": user["role"], "user": user}
