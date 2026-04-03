from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pathlib import Path

from app.schemas.qa_schema import AskQuestionRequest, AskQuestionResponse, ChatHistoryResponse
from app.services.chat_service import ask_question, get_user_history
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask", response_model=AskQuestionResponse)
async def ask(payload: AskQuestionRequest, current_user: dict = Depends(get_current_user)):
    return await ask_question(
        user_id=current_user["id"],
        question=payload.question,
        conversation_id=payload.conversation_id
    )


@router.get("/history", response_model=list[ChatHistoryResponse])
async def history(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    return await get_user_history(user_id=current_user["id"], limit=limit)

from app.services.document_service import download_document




@router.get("/documents/{document_id}/download")
async def download_document_api(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await download_document(document_id)