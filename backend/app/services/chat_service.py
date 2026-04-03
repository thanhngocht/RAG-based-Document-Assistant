from datetime import datetime, timezone

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from starlette.concurrency import run_in_threadpool

from app.daos.history_dao import create_history, list_user_history, serialize_history
from app.database.milvus import create_retriever, get_llm

SYSTEM_PROMPT = """
Bạn là Trợ lý Ảo tra cứu văn bản hành chính Việt Nam.

Quy tắc bắt buộc:
- Chỉ trả lời dựa trên CĂN CỨ được cung cấp
- Không suy đoán
- Không bổ sung thông tin ngoài căn cứ
- Nếu căn cứ không đủ để trả lời: trả lời "Không đủ thông tin để trả lời"
- Chỉ trả lời bằng tiếng Việt
- Văn phong hành chính – pháp lý

QUAN TRỌNG - Định dạng câu trả lời PHẢI dùng Markdown:
- Dùng **text** để in đậm các thuật ngữ quan trọng (tên điều khoản, số liệu, tên văn bản)
- Dùng dấu gạch đầu dòng (- ) cho danh sách
- Dùng số thứ tự (1. 2. 3.) cho các bước
- Dùng `text` cho mã số 
- Xuống dòng 2 lần để tạo đoạn văn mới

"""

USER_PROMPT = """
CĂN CỨ:
{context}

---

CÂU HỎI:
{question}

---

YÊU CẦU TRẢ LỜI:
- Văn phong hành chính – pháp lý
- Không suy diễn ngoài nội dung cung cấp

TRẢ LỜI:
"""


def _ask_sync(question: str) -> tuple[str, list[dict]]:
    retriever = create_retriever()
    docs = retriever.invoke(question)
    
    # ✅ DEBUG: Check if metadata is returned
    print(f"[DEBUG] Number of docs retrieved: {len(docs)}")
    if docs:
        print(f"[DEBUG] First doc metadata: {docs[0].metadata}")
        print(f"[DEBUG] Metadata keys: {list(docs[0].metadata.keys())}")
    
    context = "\n\n".join(doc.page_content for doc in docs)

    if not context.strip():
        return "Không đủ thông tin để trả lời", []
    


    prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", USER_PROMPT)])
    chain = prompt | get_llm() | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})

    sources = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        filename = doc.metadata.get("filename", "Unknown")
        page = doc.metadata.get("page", "?")  # Default to "?" if page is None
        document_id = doc.metadata.get("document_id")  # Get document_id from metadata
        print(f"[DEBUG] Doc metadata: {doc.metadata}")  # ✅ Debug each doc
        sources.append({
            "filename": filename, 
            "page": page, 
            "content_preview": doc.page_content[:200],
            "document_id": document_id  # Include document_id for download
        })

    return answer, sources


async def ask_question(user_id: str, question: str, conversation_id: str | None = None) -> dict:
    """
    Ask a question and get an answer with sources.
    If conversation_id is provided, add to existing conversation.
    If not, create a new conversation.
    """
    from app.services.conversation_service import (
        add_message_to_conversation,
        create_new_conversation,
        generate_conversation_title,
    )
    
    # If no conversation_id, create new conversation
    if not conversation_id:
        title = generate_conversation_title(question)
        conversation = await create_new_conversation(user_id, title)
        conversation_id = conversation.id
    
    # Add user message to conversation
    user_message = await add_message_to_conversation(
        conversation_id=conversation_id,
        role="user",
        content=question
    )
    
    # Get answer from LLM
    answer, sources = await run_in_threadpool(_ask_sync, question)
    
    # Add assistant message to conversation
    assistant_message = await add_message_to_conversation(
        conversation_id=conversation_id,
        role="assistant",
        content=answer,
        sources=sources
    )
    
    # Also save to old chat_history for backward compatibility
    history = await create_history(
        {
            "user_id": user_id,
            "question": question,
            "answer": answer,
            "sources": sources,
        }
    )
    serialized = serialize_history(history)
    
    return {
        "conversation_id": conversation_id,
        "question": question,
        "answer": answer,
        "sources": sources,
        "created_at": serialized["created_at"],
    }


async def get_user_history(user_id: str, limit: int) -> list[dict]:
    limit = max(1, min(limit, 100))
    records = await list_user_history(user_id=user_id, limit=limit)
    serialized = [serialize_history(item) for item in records]
    return [
        {
            "id": item["id"],
            "question": item["question"],
            "answer": item["answer"],
            "sources": item["sources"],
            "created_at": item["created_at"],
        }
        for item in serialized
    ]
