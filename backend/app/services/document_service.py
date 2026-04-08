import shutil
import logging
from pathlib import Path
from uuid import uuid4
from typing import List

from fastapi import HTTPException, UploadFile, status
from langchain_community.document_loaders import UnstructuredPDFLoader, UnstructuredWordDocumentLoader
from langchain_community.vectorstores.utils import filter_complex_metadata
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_docling import DoclingLoader
from langchain_docling.loader import ExportType
from docling.chunking import HybridChunker

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    TableStructureOptions,
    TesseractCliOcrOptions,
    EasyOcrOptions,
    
)
from docling.document_converter import DocumentConverter, PdfFormatOption


from app.config import settings


from app.daos.document_dao import (
    create_document,
    delete_document,
    find_document_by_id,
    list_documents,
    serialize_document,
    update_document,
)
from app.database.milvus import get_milvus_client, get_vectorstore, get_embeddings

# Configure logger - only for this module
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create handlers
file_handler = logging.FileHandler('document_service_debug.log')
console_handler = logging.StreamHandler()

# Set format
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add handlers to logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Suppress debug logs from other libraries
logging.getLogger('pymongo').setLevel(logging.WARNING)
logging.getLogger('urllib3').setLevel(logging.WARNING)
logging.getLogger('matplotlib').setLevel(logging.WARNING)
logging.getLogger('docling').setLevel(logging.INFO)

def build_converter(use_ocr=False, use_table=False, lang="vi"):  # ✅ Disabled by default for speed
    logger.debug(f"Building converter with use_ocr={use_ocr}, use_table={use_table}, lang={lang}")
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = use_ocr
    pipeline_options.do_table_structure = use_table

    if use_table:
        logger.debug("Configuring table structure options")
        pipeline_options.table_structure_options = TableStructureOptions(
            do_cell_matching=True
        )

    if use_ocr:
        logger.debug(f"Configuring OCR options with language: {lang}")
        ocr_options = EasyOcrOptions(
            force_full_page_ocr=False,
            lang=[lang],
        )
        pipeline_options.ocr_options = ocr_options

    logger.debug("Creating DocumentConverter instance")
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
            )
        }
    )

    logger.info("Converter built successfully")
    return converter

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}




# Global cache
GLOBAL_CHUNKER = HybridChunker(
    tokenizer="BAAI/bge-m3",
    chunk_size=1000,
    chunk_overlap=100,
)

# Chunking
def _load_documents_from_file(file_path: Path) -> list[Document]:
    logger.info(f"Starting to load document from: {file_path}")
    logger.debug(f"File exists: {file_path.exists()}, File size: {file_path.stat().st_size if file_path.exists() else 'N/A'} bytes")
    
    try:
        loader = DoclingLoader(
            file_path=str(file_path),
            export_type=ExportType.DOC_CHUNKS,
            chunker=GLOBAL_CHUNKER,
        ) 
        logger.debug(f"DoclingLoader initialized for {file_path}")
        print(f"Loading and chunking document {file_path} with DoclingLoader...")
        
        docs = loader.load()
        logger.info(f"Successfully loaded {len(docs)} chunks from {file_path}")
        print(f"Number of chunks: {len(docs)}")
        
        if docs:
            print(docs[1] if len(docs) > 1 else docs[0])
            logger.debug(f"Sample chunk metadata: {docs[0].metadata if docs else 'No chunks'}")
        
    except Exception as e:
        logger.error(f"Error loading document {file_path}: {str(e)}", exc_info=True)
        raise

    logger.debug("Adding metadata to chunks")
    for i, doc in enumerate(docs):
        doc.metadata = clean_metadata(doc, i, file_path)

    logger.info(f"Metadata added to all {len(docs)} chunks")
    logger.debug(f"Sample chunk metadata: {docs[0].metadata if docs else 'No chunks'}")
    return docs

def clean_metadata(doc, index, file_path: Path):
    meta = doc.metadata

    dl_meta = meta.get("dl_meta", {})

    # extract page - default to 1 if not found
    page = 1
    try:
        page = dl_meta["doc_items"][0]["prov"][0]["page_no"]
    except Exception:
        pass

    # extract heading - default to empty string if not found
    heading = ""
    if "headings" in dl_meta:
        heading = " ".join(dl_meta["headings"])

    # ✅ Remove UUID prefix from filename for cleaner display
    # "abc123def_Nghi_dinh_123_2024.pdf" -> "Nghi_dinh_123_2024.pdf"
    full_name = file_path.name
    if '_' in full_name:
        original_name = full_name.split('_', 1)[1]  # Split at first underscore, take second part
    else:
        original_name = full_name

    return {
        "source": str(file_path),
        "filename": original_name,  # Clean filename without UUID prefix
        "chunk_id": index,
        "page": page,
        "heading": heading
    }


# def _ingest_file(file_path: Path) -> int:
#     chunks = _load_documents_from_file(file_path)
#     ensure_milvus_connection()
#     vectorstore = create_vectorstore()
#     vectorstore.add_documents(chunks)
#     return len(chunks)

# 2.Ingest
def _ingest_file(file_path: Path, document_id: str) -> int:
    logger.info(f"Starting ingestion for document_id: {document_id}, file: {file_path}")
    
    try:
        chunks = _load_documents_from_file(file_path)
        logger.debug(f"Loaded {len(chunks)} chunks for ingestion")
        print("Ingesting chunks into vectorstore...")
        
        # ✅ thêm document_id để delete/query
        for i, chunk in enumerate(chunks):
            chunk.metadata["document_id"] = document_id
        logger.debug(f"Added document_id to all {len(chunks)} chunk metadata")

        logger.debug("Getting Milvus client")
        get_milvus_client()
        
        logger.debug("Getting vectorstore")
        vectorstore = get_vectorstore()  # ❗ không dùng create nữa
        
        logger.info(f"Adding {len(chunks)} documents to vectorstore")
        # vectorstore.add_documents(chunks)

        BATCH_SIZE = 5
        for i in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[i:i+BATCH_SIZE]
            vectorstore.add_documents(batch)
            logger.info(f"Added batch {i}-{i+len(batch)} chunks")
        
        logger.info(f"Successfully ingested {len(chunks)} chunks for document_id: {document_id}")
        return len(chunks)
        
    except Exception as e:
        logger.error(f"Error during ingestion for document_id {document_id}: {str(e)}", exc_info=True)
        raise

# 3.Single file
async def save_and_ingest_document(file: UploadFile, uploaded_by: str) -> dict:
    logger.info(f"Starting save_and_ingest_document for file uploaded by: {uploaded_by}")
    
    filename = file.filename or ""
    logger.debug(f"Processing file: {filename}")
    extension = Path(filename).suffix.lower()
    logger.debug(f"File extension: {extension}")

    if extension not in ALLOWED_EXTENSIONS:
        logger.warning(f"Invalid file extension: {extension}. Allowed: {ALLOWED_EXTENSIONS}")
        raise HTTPException(400, "Chỉ hỗ trợ PDF/TXT/DOC/DOCX")

    logger.debug(f"Creating upload directory: {settings.upload_dir}")
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid4().hex}_{Path(filename).name}"
    destination = settings.upload_dir / safe_name
    logger.debug(f"Destination path: {destination}")

    # save file
    logger.debug("Starting file save operation")
    try:
        with destination.open("wb") as output_file:
            shutil.copyfileobj(file.file, output_file)
        logger.info(f"File saved successfully to: {destination}")
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}", exc_info=True)
        raise

    # Get file size
    file_size = destination.stat().st_size if destination.exists() else 0
    logger.debug(f"File size: {file_size} bytes")

    # ✅ 1. create document trước
    logger.debug("Creating document record in database")
    doc = await create_document(
        {
            "filename": Path(filename).name,
            "source_path": str(destination),
            "uploaded_by": uploaded_by,
            "status": "processing",
            "file_size": file_size,
        }
    )
    
    doc_id = str(doc["_id"])
    logger.info(f"Document created with ID: {doc_id}")

    try:
        # ✅ 2. ingest
        logger.info(f"Starting ingestion for document_id: {doc_id}")
        chunk_count = _ingest_file(destination, doc_id)
        logger.info(f"Ingestion completed: {chunk_count} chunks")

        # ✅ 3. update success
        logger.debug(f"Updating document status to '1' for doc_id: {doc_id}")
        await update_document(
            doc_id,
            {
                "status": "done",
                "chunk_count": chunk_count,
            },
        )
        logger.info(f"Document {doc_id} processed successfully")

    except Exception as exc:
        logger.error(f"Error processing document {doc_id}: {str(exc)}", exc_info=True)
        logger.debug(f"Cleaning up file: {destination}")
        destination.unlink(missing_ok=True)

        logger.debug(f"Updating document status to 'failed' for doc_id: {doc_id}")
        updated_doc = await update_document(
            doc_id,
            {
                "status": "failed",
                "error_message": str(exc),
            },
        )
        logger.warning(f"Document {doc_id} marked as failed")

        return serialize_document(updated_doc)

    return serialize_document(doc)


# MULTI FILE
async def save_multiple_documents(
    files: List[UploadFile],
    uploaded_by: str,
) -> list[dict]:
    logger.info(f"Starting save_multiple_documents: {len(files)} files, uploaded_by: {uploaded_by}")
    
    results = []

    for idx, file in enumerate(files):
        logger.debug(f"Processing file {idx + 1}/{len(files)}: {file.filename}")
        try:
            result = await save_and_ingest_document(file, uploaded_by)
            results.append(result)
            logger.debug(f"File {idx + 1} processed successfully")
        except Exception as e:
            logger.error(f"Error processing file {idx + 1} ({file.filename}): {str(e)}", exc_info=True)
            raise

    logger.info(f"Completed processing {len(results)} files")
    return results


# GET LIST
async def get_documents() -> list[dict]:
    logger.debug("Fetching documents list")
    try:
        docs = await list_documents()
        logger.info(f"Retrieved {len(docs)} documents from database")
        serialized = [serialize_document(doc) for doc in docs]
        logger.debug("Documents serialized successfully")
        return serialized
    except Exception as e:
        logger.error(f"Error fetching documents: {str(e)}", exc_info=True)
        raise



# DELETE
async def remove_document(document_id: str) -> None:
    logger.info(f"Starting document removal for document_id: {document_id}")
    
    logger.debug(f"Finding document with ID: {document_id}")
    document = await find_document_by_id(document_id)

    if not document:
        logger.warning(f"Document not found: {document_id}")
        raise HTTPException(404, "Không tìm thấy tài liệu")

    logger.debug(f"Document found: {document.get('filename', 'N/A')}")
    logger.debug("Getting vectorstore for deletion")
    vectorstore = get_vectorstore()

    try:
        # ✅ delete theo document_id (chuẩn)
        logger.info(f"Deleting embeddings for document_id: {document_id}")
        vectorstore.delete(expr=f'document_id == "{document_id}"')
        logger.info(f"Embeddings deleted successfully for document_id: {document_id}")

    except Exception as exc:
        logger.error(f"Error deleting embeddings for {document_id}: {str(exc)}", exc_info=True)
        raise HTTPException(500, f"Không thể xóa embedding: {exc}")

    logger.debug(f"Deleting document record from database: {document_id}")
    deleted = await delete_document(document_id)

    if not deleted:
        logger.error(f"Failed to delete document record: {document_id}")
        raise HTTPException(500, "Không thể xóa document")

    # xóa file local
    file_path = Path(document["source_path"])
    logger.debug(f"Deleting local file: {file_path}")
    try:
        file_path.unlink(missing_ok=True)
        logger.info(f"Local file deleted successfully: {file_path}")
    except Exception as e:
        logger.warning(f"Error deleting local file {file_path}: {str(e)}")
    
    logger.info(f"Document {document_id} removed successfully")


from fastapi.responses import FileResponse


async def download_document(document_id: str) -> FileResponse:
    logger.info(f"Starting download for document_id: {document_id}")
    from app.config import settings

    # tìm document
    document = await find_document_by_id(document_id)

    if not document:
        logger.warning(f"Document not found: {document_id}")
        raise HTTPException(404, "Không tìm thấy tài liệu")

    # lấy file path thật - source_path có dạng "uploads/UUID_filename.pdf"
    source_path = document["source_path"]
    file_path = Path(source_path)
    
    # Nếu là relative path, convert thành absolute từ project root
    if not file_path.is_absolute():
        # source_path = "uploads/xxx.pdf" -> base_dir/uploads/xxx.pdf
        file_path = settings.upload_dir.parent / source_path

    logger.debug(f"File path: {file_path}")

    if not file_path.exists():
        logger.warning(f"File not found on disk: {file_path}")
        raise HTTPException(404, "File không tồn tại trên server")

    logger.info(f"Download ready: {file_path}")

    # Trả về với tên gốc (không có UUID prefix) để user download file đẹp
    return FileResponse(
        path=str(file_path),
        filename=document["filename"],  # tên gốc: "VanBanGoc_TT.04.2026.TT BCT.pdf"
        media_type="application/octet-stream"
    )