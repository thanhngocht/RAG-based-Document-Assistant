from pydantic import BaseModel
import enum
from datetime import datetime




class DocumentResponse(BaseModel):
    id: str
    filename: str
    source_path: str
    uploaded_by: str
    status: str
    created_at: datetime | None = None
    chunk_count: int = 0
    error_message: str | None = None
    file_size: int = 0

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_type: str
    file_size: int


class DocumentCreate(DocumentBase):
    workspace_id: int


# class DocumentResponse(DocumentBase):
#     id: int
#     workspace_id: int
#     status: str
#     chunk_count: int
#     error_message: str | None
#     created_at: datetime
#     updated_at: datetime
#     page_count: int = 0
#     image_count: int = 0
#     table_count: int = 0
#     parser_version: str | None = None
#     processing_time_ms: int = 0

#     model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    message: str