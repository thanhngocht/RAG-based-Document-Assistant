from datetime import datetime, timezone

from bson import ObjectId

from app.config import settings
from app.database.mongo import get_collection


def serialize_document(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "filename": document["filename"],
        "source_path": document["source_path"],
        "uploaded_by": document["uploaded_by"],
        "status": document.get("status", "unknown"),
        "created_at": document.get("created_at"),
        "chunk_count": document.get("chunk_count", 0),
        "error_message": document.get("error_message", ""),
        "file_size": document.get("file_size", 0),
    }


async def create_document(doc: dict) -> dict:
    collection = get_collection(settings.documents_collection)
    doc["created_at"] = datetime.now(tz=timezone.utc)
    result = await collection.insert_one(doc)
    inserted = await collection.find_one({"_id": result.inserted_id})
    if not inserted:
        raise Exception("Failed to create document record.")
    return inserted

async def update_document(document_id: str, update_fields: dict) -> dict:
    conlection = get_collection(settings.documents_collection)
    try:
        object_id = ObjectId(document_id)
    except Exception:
        raise Exception("Invalid document ID format.")
    result = await conlection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise Exception("Document not found.")
    updated = await conlection.find_one({"_id": object_id})
    if not updated:
        raise Exception("Failed to retrieve updated document.")
    return updated
 

async def list_documents() -> list[dict]:
    collection = get_collection(settings.documents_collection)
    docs = []
    async for document in collection.find({}, sort=[("created_at", -1)]):
        docs.append(document)
    return docs


async def find_document_by_id(document_id: str) -> dict | None:
    collection = get_collection(settings.documents_collection)
    try:
        object_id = ObjectId(document_id)
    except Exception:
        return None
    return await collection.find_one({"_id": object_id})


async def delete_document(document_id: str) -> bool:
    collection = get_collection(settings.documents_collection)
    try:
        object_id = ObjectId(document_id)
    except Exception:
        return False
    result = await collection.delete_one({"_id": object_id})
    return result.deleted_count > 0
