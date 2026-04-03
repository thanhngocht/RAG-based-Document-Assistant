"""
Conversation service for managing conversations and messages
"""

from app.daos import conversation_dao, message_dao
from app.schemas.conversation_schema import (
    ConversationListResponse,
    ConversationResponse,
    ConversationWithMessages,
    MessageResponse,
)


async def create_new_conversation(user_id: str, title: str, description: str | None = None) -> ConversationResponse:
    """Create a new conversation"""
    conversation = await conversation_dao.create_conversation(user_id, title, description)
    serialized = conversation_dao.serialize_conversation(conversation)
    return ConversationResponse(**serialized)


async def get_user_conversations(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    status: str | None = None
) -> ConversationListResponse:
    """Get list of user's conversations with pagination"""
    conversations, total = await conversation_dao.list_user_conversations(user_id, limit, offset, status)
    
    items = [
        ConversationResponse(**conversation_dao.serialize_conversation(conv))
        for conv in conversations
    ]
    
    return ConversationListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=items
    )


async def get_conversation_detail(conversation_id: str, user_id: str) -> ConversationWithMessages | None:
    """Get a conversation with all its messages"""
    # Get conversation
    conversation = await conversation_dao.get_conversation_by_id(conversation_id)
    if not conversation:
        return None
    
    # Verify ownership
    if conversation["user_id"] != user_id:
        return None
    
    # Get messages
    messages = await message_dao.list_conversation_messages(conversation_id)
    
    # Serialize
    conv_data = conversation_dao.serialize_conversation(conversation)
    messages_data = [
        MessageResponse(**message_dao.serialize_message(msg))
        for msg in messages
    ]
    
    return ConversationWithMessages(
        **conv_data,
        messages=messages_data
    )


async def update_conversation_title(
    conversation_id: str,
    user_id: str,
    title: str,
    description: str | None = None
) -> ConversationResponse | None:
    """Update conversation title and description"""
    # Verify ownership
    conversation = await conversation_dao.get_conversation_by_id(conversation_id)
    if not conversation or conversation["user_id"] != user_id:
        return None
    
    # Update
    updates = {"title": title}
    if description is not None:
        updates["description"] = description
    
    updated = await conversation_dao.update_conversation(conversation_id, updates)
    if not updated:
        return None
    
    serialized = conversation_dao.serialize_conversation(updated)
    return ConversationResponse(**serialized)


async def delete_conversation_logic(conversation_id: str, user_id: str) -> bool:
    """Delete a conversation and all its messages"""
    # Verify ownership
    conversation = await conversation_dao.get_conversation_by_id(conversation_id)
    if not conversation or conversation["user_id"] != user_id:
        return False
    
    # Delete messages first
    await message_dao.delete_conversation_messages(conversation_id)
    
    # Delete conversation
    return await conversation_dao.delete_conversation(conversation_id)


async def archive_conversation_logic(conversation_id: str, user_id: str, archived: bool = True) -> ConversationResponse | None:
    """Archive or unarchive a conversation"""
    # Verify ownership
    conversation = await conversation_dao.get_conversation_by_id(conversation_id)
    if not conversation or conversation["user_id"] != user_id:
        return None
    
    # Archive
    updated = await conversation_dao.archive_conversation(conversation_id, archived)
    if not updated:
        return None
    
    serialized = conversation_dao.serialize_conversation(updated)
    return ConversationResponse(**serialized)


async def add_message_to_conversation(
    conversation_id: str,
    role: str,
    content: str,
    sources: list[dict] | None = None
) -> MessageResponse:
    """Add a message to a conversation and update conversation metadata"""
    # Create message
    message = await message_dao.create_message(conversation_id, role, content, sources)
    
    # Update conversation stats
    await conversation_dao.increment_message_count(conversation_id)
    
    # Serialize and return
    serialized = message_dao.serialize_message(message)
    return MessageResponse(**serialized)


def generate_conversation_title(first_message: str, max_length: int = 50) -> str:
    """Generate a conversation title from the first user message"""
    # Trim to max length
    if len(first_message) <= max_length:
        return first_message
    
    # Cut at word boundary
    truncated = first_message[:max_length].rsplit(' ', 1)[0]
    return truncated + "..."
