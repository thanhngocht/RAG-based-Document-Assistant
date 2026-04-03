from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pathlib import Path
from app.daos.user_dao import delete_user, list_users, serialize_user, update_user
from app.schemas.auth_schema import RegisterRequest
from app.schemas.document_schema import DocumentResponse
from app.schemas.user_schema import UserCreateRequest, UserResponse, UserRole, UserUpdateRequest
from app.services.auth_service import register_user
from app.services.document_service import get_documents, remove_document, save_and_ingest_document, save_multiple_documents
from app.utils.dependencies import require_admin
from app.utils.security import hash_password
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/users", response_model=UserResponse)
async def create_user_by_admin(payload: UserCreateRequest):
    register_payload = RegisterRequest(
        username=payload.username,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )
    created = await register_user(payload=register_payload, role=payload.role)
    return created


@router.get("/users", response_model=list[UserResponse])
async def get_users():
    users = await list_users()
    return [serialize_user(user) for user in users]


@router.patch("/users/{user_id}", response_model=UserResponse)
async def patch_user(user_id: str, payload: UserUpdateRequest):
    update_doc = payload.model_dump(exclude_none=True)
    if "password" in update_doc:
        update_doc["password_hash"] = hash_password(update_doc.pop("password"))
    if "role" in update_doc and isinstance(update_doc["role"], UserRole):
        update_doc["role"] = update_doc["role"].value

    updated = await update_user(user_id, update_doc)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy user")
    return serialize_user(updated)


@router.delete("/users/{user_id}")
async def remove_user(user_id: str):
    deleted = await delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy user")
    return {"message": "Đã xóa user"}


# Document
# @router.post("/documents/upload", response_model=DocumentResponse)
# async def upload_document(file: UploadFile = File(...), current_admin: dict = Depends(require_admin)):
#     return await save_and_ingest_document(file=file, uploaded_by=current_admin["id"])



@router.post("/documents/upload", response_model=List[DocumentResponse])
async def upload_documents(
    files: List[UploadFile] = File(...),
    current_admin: dict = Depends(require_admin),
):
    return await save_multiple_documents(
        files=files,
        uploaded_by=current_admin["id"]
    )

@router.get("/documents", response_model=list[DocumentResponse])
async def list_admin_documents():
    return await get_documents()


@router.get("/documents/{document_id}/download")
async def download_document(document_id: str):
    from app.config import settings
    
    # Get document metadata from database
    documents = await get_documents()
    doc = next((d for d in documents if d.id == document_id), None)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document không tồn tại")
    
    # Construct file path
    file_path = settings.upload_dir / doc.filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File không tồn tại trên server")
    
    return FileResponse(
        path=str(file_path),
        filename=doc.filename,
        media_type='application/octet-stream'
    )


@router.delete("/documents/{document_id}")
async def delete_admin_document(document_id: str):
    await remove_document(document_id)
    return {"message": "Đã xóa document"}
