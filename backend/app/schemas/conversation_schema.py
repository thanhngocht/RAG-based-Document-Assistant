from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ConversationStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


# Message Schemas
class MessageCreate(BaseModel):
    conversation_id: str
    role: MessageRole
    content: str = Field(min_length=1, max_length=10000)
    sources: list[dict] | None = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: MessageRole
    content: str
    sources: list[dict] | None = None
    created_at: datetime


# Conversation Schemas
class ConversationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=500)


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    status: ConversationStatus | None = None


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str | None = None
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime
    last_message_at: datetime
    message_count: int


class ConversationWithMessages(ConversationResponse):
    messages: list[MessageResponse]


class ConversationListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[ConversationResponse]
