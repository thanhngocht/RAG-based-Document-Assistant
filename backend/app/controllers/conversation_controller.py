from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.conversation_schema import (
    ConversationCreate,
    ConversationListResponse,
    ConversationResponse,
    ConversationUpdate,
    ConversationWithMessages,
)
from app.services import conversation_service
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new conversation"""
    return await conversation_service.create_new_conversation(
        user_id=current_user["id"],
        title=payload.title,
        description=payload.description
    )


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user)
):
    """List user's conversations with pagination"""
    return await conversation_service.get_user_conversations(
        user_id=current_user["id"],
        limit=limit,
        offset=offset,
        status=status
    )


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a conversation with all messages"""
    conversation = await conversation_service.get_conversation_detail(
        conversation_id=conversation_id,
        user_id=current_user["id"]
    )
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation


@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update conversation title and/or description"""
    updates = {}
    if payload.title:
        updates["title"] = payload.title
    if payload.description is not None:
        updates["description"] = payload.description
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided"
        )
    
    conversation = await conversation_service.update_conversation_title(
        conversation_id=conversation_id,
        user_id=current_user["id"],
        **updates
    )
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a conversation and all its messages"""
    deleted = await conversation_service.delete_conversation_logic(
        conversation_id=conversation_id,
        user_id=current_user["id"]
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )


@router.patch("/{conversation_id}/archive", response_model=ConversationResponse)
async def archive_conversation(
    conversation_id: str,
    archived: bool = Query(default=True),
    current_user: dict = Depends(get_current_user)
):
    """Archive or unarchive a conversation"""
    conversation = await conversation_service.archive_conversation_logic(
        conversation_id=conversation_id,
        user_id=current_user["id"],
        archived=archived
    )
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation
