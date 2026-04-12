import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str
    api_prefix: str
    mongo_uri: str
    mongo_db: str
    users_collection: str
    documents_collection: str
    history_collection: str
    conversations_collection: str
    messages_collection: str
    jwt_secret: str
    jwt_algorithm: str
    token_expire_minutes: int
    collection_name: str
    milvus_endpoint: str
    embedding_model: str
    model_name: str
    upload_dir: Path


def load_settings() -> Settings:
    upload_dir_raw = os.getenv("UPLOAD_DIR", str(Path.cwd() / "uploads"))
    return Settings(
        app_name=os.getenv("APP_NAME"),
        api_prefix=os.getenv("API_PREFIX"),

        mongo_uri=os.getenv("MONGO_URI"),
        mongo_db=os.getenv("MONGO_DB"),
        users_collection=os.getenv("USERS_COLLECTION"),
        documents_collection=os.getenv("DOCUMENTS_COLLECTION"),
        history_collection=os.getenv("HISTORY_COLLECTION"),
        conversations_collection=os.getenv("CONVERSATIONS_COLLECTION"),
        messages_collection=os.getenv("MESSAGES_COLLECTION"),

        jwt_secret=os.getenv("JWT_SECRET"),
        jwt_algorithm=os.getenv("JWT_ALGORITHM"),
        token_expire_minutes=int(os.getenv("TOKEN_EXPIRE_MINUTES")),
        
        collection_name=os.getenv("COLLECTION_NAME"),
        milvus_endpoint=os.getenv("MILVUS_ENDPOINT"),
        embedding_model=os.getenv("EMBEDDING_MODEL"),
        model_name=os.getenv("MODEL_NAME"),
        upload_dir=Path(upload_dir_raw),
    )


settings = load_settings()
