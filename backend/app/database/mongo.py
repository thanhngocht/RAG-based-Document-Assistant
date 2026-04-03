from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase

from app.config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def init_mongo() -> None:
    global _client, _db
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
        _db = _client[settings.mongo_db]


async def close_mongo() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB is not initialized. Call init_mongo() on startup.")
    return _db


def get_collection(name: str) -> AsyncIOMotorCollection:
    return get_database()[name]
