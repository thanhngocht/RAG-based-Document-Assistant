from datetime import datetime, timezone

from bson import ObjectId

from app.config import settings
from app.database.mongo import get_collection


def serialize_conversation(item: dict) -> dict:
    """Convert MongoDB conversation document to serializable dict"""
    return {
        "id": str(item["_id"]),
        "user_id": item["user_id"],
        "title": item["title"],
        "description": item.get("description"),
        "status": item["status"],
        "created_at": item["created_at"],
        "updated_at": item["updated_at"],
        "last_message_at": item["last_message_at"],
        "message_count": item["message_count"],
    }


async def create_conversation(user_id: str, title: str, description: str | None = None) -> dict:
    """Create a new conversation"""
    collection = get_collection(settings.conversations_collection)
    
    now = datetime.now(tz=timezone.utc)
    conversation = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "status": "active",
        "created_at": now,
        "updated_at": now,
        "last_message_at": now,
        "message_count": 0,
    }
    
    result = await collection.insert_one(conversation)
    inserted = await collection.find_one({"_id": result.inserted_id})
    return inserted


async def list_user_conversations(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    status: str | None = None
) -> tuple[list[dict], int]:
    """List conversations for a user with pagination"""
    collection = get_collection(settings.conversations_collection)
    
    # Build filter
    filter_query = {"user_id": user_id}
    if status:
        filter_query["status"] = status
    
    # Get total count
    total = await collection.count_documents(filter_query)
    
    # Get paginated results
    conversations = []
    cursor = collection.find(filter_query).sort("last_message_at", -1).skip(offset).limit(limit)
    async for item in cursor:
        conversations.append(item)
    
    return conversations, total


async def get_conversation_by_id(conversation_id: str) -> dict | None:
    """Get a conversation by ID"""
    collection = get_collection(settings.conversations_collection)
    
    try:
        return await collection.find_one({"_id": ObjectId(conversation_id)})
    except Exception:
        return None


async def update_conversation(conversation_id: str, updates: dict) -> dict | None:
    """Update a conversation"""
    collection = get_collection(settings.conversations_collection)
    
    # Add updated_at timestamp
    updates["updated_at"] = datetime.now(tz=timezone.utc)
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(conversation_id)},
            {"$set": updates},
            return_document=True
        )
        return result
    except Exception:
        return None


async def delete_conversation(conversation_id: str) -> bool:
    """Delete a conversation (hard delete)"""
    collection = get_collection(settings.conversations_collection)
    
    try:
        result = await collection.delete_one({"_id": ObjectId(conversation_id)})
        return result.deleted_count > 0
    except Exception:
        return False


async def archive_conversation(conversation_id: str, archived: bool = True) -> dict | None:
    """Archive or unarchive a conversation"""
    status = "archived" if archived else "active"
    return await update_conversation(conversation_id, {"status": status})


async def increment_message_count(conversation_id: str) -> None:
    """Increment message count and update last_message_at"""
    collection = get_collection(settings.conversations_collection)
    
    try:
        await collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$inc": {"message_count": 1},
                "$set": {
                    "last_message_at": datetime.now(tz=timezone.utc),
                    "updated_at": datetime.now(tz=timezone.utc)
                }
            }
        )
    except Exception:
        pass
