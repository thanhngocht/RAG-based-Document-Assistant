from datetime import datetime, timezone

from bson import ObjectId

from app.config import settings
from app.database.mongo import get_collection


def serialize_message(item: dict) -> dict:
    """Convert MongoDB message document to serializable dict"""
    created_at = item["created_at"]
    # Convert datetime to ISO string with timezone (UTC)
    if hasattr(created_at, 'isoformat'):
        created_at = created_at.isoformat()
    elif isinstance(created_at, str) and not created_at.endswith('Z') and '+' not in created_at:
        # If string without timezone, assume UTC and add Z
        created_at = created_at + 'Z' if '.' in created_at else created_at + '.000Z'
    
    return {
        "id": str(item["_id"]),
        "conversation_id": item["conversation_id"],
        "role": item["role"],
        "content": item["content"],
        "sources": item.get("sources"),
        "created_at": created_at,
    }


async def create_message(
    conversation_id: str,
    role: str,
    content: str,
    sources: list[dict] | None = None
) -> dict:
    """Create a new message in a conversation"""
    collection = get_collection(settings.messages_collection)
    
    message = {
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "sources": sources,
        "created_at": datetime.now(tz=timezone.utc),
    }
    
    result = await collection.insert_one(message)
    inserted = await collection.find_one({"_id": result.inserted_id})
    return inserted


async def list_conversation_messages(
    conversation_id: str,
    limit: int | None = None,
    offset: int = 0
) -> list[dict]:
    """List all messages in a conversation, ordered by creation time"""
    collection = get_collection(settings.messages_collection)
    
    cursor = collection.find({"conversation_id": conversation_id}).sort("created_at", 1).skip(offset)
    
    if limit:
        cursor = cursor.limit(limit)
    
    messages = []
    async for item in cursor:
        messages.append(item)
    
    return messages


async def get_message_by_id(message_id: str) -> dict | None:
    """Get a message by ID"""
    collection = get_collection(settings.messages_collection)
    
    try:
        return await collection.find_one({"_id": ObjectId(message_id)})
    except Exception:
        return None


async def delete_message(message_id: str) -> bool:
    """Delete a message"""
    collection = get_collection(settings.messages_collection)
    
    try:
        result = await collection.delete_one({"_id": ObjectId(message_id)})
        return result.deleted_count > 0
    except Exception:
        return False


async def delete_conversation_messages(conversation_id: str) -> int:
    """Delete all messages in a conversation"""
    collection = get_collection(settings.messages_collection)
    
    try:
        result = await collection.delete_many({"conversation_id": conversation_id})
        return result.deleted_count
    except Exception:
        return 0


async def count_conversation_messages(conversation_id: str) -> int:
    """Count messages in a conversation"""
    collection = get_collection(settings.messages_collection)
    return await collection.count_documents({"conversation_id": conversation_id})
