from datetime import datetime, timezone

from bson import ObjectId

from app.config import settings
from app.database.mongo import get_collection


def serialize_history(item: dict) -> dict:
    return {
        "id": str(item["_id"]),
        "user_id": item["user_id"],
        "question": item["question"],
        "answer": item["answer"],
        "sources": item.get("sources", []),
        "created_at": item.get("created_at"),
    }


async def create_history(item: dict) -> dict:
    collection = get_collection(settings.history_collection)
    item["created_at"] = datetime.now(tz=timezone.utc)
    result = await collection.insert_one(item)
    inserted = await collection.find_one({"_id": result.inserted_id})
    return inserted


async def list_user_history(user_id: str, limit: int = 20) -> list[dict]:
    collection = get_collection(settings.history_collection)
    histories = []
    async for item in collection.find({"user_id": user_id}, sort=[("created_at", -1)]).limit(limit):
        histories.append(item)
    return histories

