from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ASCENDING

from app.config import settings
from app.database.mongo import get_collection


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "full_name": user.get("full_name"),
        "role": user["role"],
        "is_active": user.get("is_active", True),
        "created_at": user.get("created_at"),
    }


async def ensure_indexes() -> None:
    collection = get_collection(settings.users_collection)
    await collection.create_index([("username", ASCENDING)], unique=True)
    await collection.create_index([("email", ASCENDING)], unique=True)


async def create_user(user_doc: dict) -> dict:
    collection = get_collection(settings.users_collection)
    user_doc["created_at"] = datetime.now(tz=timezone.utc)
    result = await collection.insert_one(user_doc)
    inserted = await collection.find_one({"_id": result.inserted_id})
    return inserted


async def find_user_by_id(user_id: str) -> dict | None:
    collection = get_collection(settings.users_collection)
    try:
        object_id = ObjectId(user_id)
    except Exception:
        return None
    return await collection.find_one({"_id": object_id})


async def find_user_by_username_or_email(identifier: str) -> dict | None:
    collection = get_collection(settings.users_collection)
    return await collection.find_one({"$or": [{"username": identifier}, {"email": identifier}]})


async def list_users() -> list[dict]:
    collection = get_collection(settings.users_collection)
    users = []
    async for user in collection.find({}, sort=[("created_at", -1)]):
        users.append(user)
    return users


async def update_user(user_id: str, update_doc: dict) -> dict | None:
    collection = get_collection(settings.users_collection)
    try:
        object_id = ObjectId(user_id)
    except Exception:
        return None
    if not update_doc:
        return await collection.find_one({"_id": object_id})
    await collection.update_one({"_id": object_id}, {"$set": update_doc})
    return await collection.find_one({"_id": object_id})


async def delete_user(user_id: str) -> bool:
    collection = get_collection(settings.users_collection)
    try:
        object_id = ObjectId(user_id)
    except Exception:
        return False
    result = await collection.delete_one({"_id": object_id})
    return result.deleted_count > 0
