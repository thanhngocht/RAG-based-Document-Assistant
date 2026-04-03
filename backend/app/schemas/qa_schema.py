from datetime import datetime

from pydantic import BaseModel, Field


class QASource(BaseModel):
    filename: str
    page: int | str | None = "?"
    content_preview: str


class AskQuestionRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    conversation_id: str | None = None


class AskQuestionResponse(BaseModel):
    conversation_id: str | None = None
    question: str
    answer: str
    sources: list[QASource]
    created_at: datetime | None = None


class ChatHistoryResponse(AskQuestionResponse):
    id: str
