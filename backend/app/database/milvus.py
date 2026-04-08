from functools import lru_cache

import ollama
from langchain_milvus import BM25BuiltInFunction, Milvus
from langchain_ollama import ChatOllama, OllamaEmbeddings
from pymilvus import MilvusClient, connections

from app.config import settings


# 1.Ollama model
def _ensure_ollama_model(model_name: str) -> None:
    try:
        ollama.show(model_name)
    except Exception as exc:
        if getattr(exc, "status_code", None) == 404 or "not found" in str(exc).lower():
            ollama.pull(model_name)
        else:
            raise
@lru_cache
def get_embeddings() -> OllamaEmbeddings:
    _ensure_ollama_model(settings.embedding_model)
    return OllamaEmbeddings(model=settings.embedding_model)

@lru_cache
def get_llm() -> ChatOllama:
    _ensure_ollama_model(settings.model_name)
    return ChatOllama(model=settings.model_name, temperature=0)


# 2.Milvus connection

@lru_cache
def get_milvus_client() -> MilvusClient:
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.debug(f"Connecting to Milvus at: {settings.milvus_endpoint}")
        client = MilvusClient(uri=settings.milvus_endpoint)
        connections.connect(
            alias=client._using, 
            uri=settings.milvus_endpoint,
            timeout=10  # Timeout after 10 seconds
        )
        logger.info("Successfully connected to Milvus")
        return client
    except Exception as e:
        logger.error(f"Failed to connect to Milvus: {str(e)}")
        logger.error(f"Make sure Milvus is running at {settings.milvus_endpoint}")
        raise RuntimeError(
            f"Cannot connect to Milvus at {settings.milvus_endpoint}. "
            f"Please start Milvus service first. Error: {str(e)}"
        )

# 3. Vectostore
@lru_cache
def get_vectorstore() -> Milvus:
    client = get_milvus_client()
    collection_name = settings.collection_name

    # vectorstore = Milvus(
    #     embedding_function=get_embeddings(),
    #     collection_name=collection_name,
    #     connection_args={"uri": settings.milvus_endpoint},
    #     vector_field=["dense", "sparse"],
    #     builtin_function=BM25BuiltInFunction(),
    #     text_field="text",  
    #     enable_dynamic_field=True,  
    # )
    vectorstore = Milvus(
        embedding_function=get_embeddings(),
        collection_name=collection_name,
        connection_args={"uri": settings.milvus_endpoint},
        index_params={
            "index_type": "FLAT",
            "metric_type": "COSINE",
        },
    

    )

    # ✅ SAFE INIT - Create with sample document containing metadata
    if not client.has_collection(collection_name):
        try:
            from langchain_core.documents import Document
            # Initialize with a sample document that has metadata structure
            sample_doc = Document(
                page_content="init",
                metadata={
                    "source": "init",
                    "filename": "init", 
                    "page": 1,
                    "chunk_id": 0,
                    "document_id": "init",
                    "heading": ""
                }
            )
            vectorstore.add_documents([sample_doc])
            print(f"[Milvus] Created collection: {collection_name}")
        except Exception:
            # worker khác đã tạo rồi
            print(f"[Milvus] Collection already created by another worker")

    else:
        print(f"[Milvus] Using existing collection: {collection_name}")

    return vectorstore

# 4. Utility functions
def drop_collection(collection_name: str | None = None) -> None:
    client = get_milvus_client()
    name = collection_name or settings.collection_name

    if client.has_collection(name):
        client.drop_collection(name)
        print(f"[Milvus] Dropped collection: {name}")
    else:
        print(f"[Milvus] Collection not found: {name}")


def reset_vectorstore() -> None:
    name = settings.collection_name
    drop_collection(name)

    # clear cache để tạo lại
    get_vectorstore.cache_clear()
    get_milvus_client.cache_clear()

    print(f"[Milvus] Reset collection: {name}")


# 5.Retriever
from langchain_huggingface import HuggingFaceEndpoint

from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# from langchain.vectorstores.contextual_compression import ContextualCompressionRetriever
# from langchain.retrievers.document_compressors import CrossEncoderReranker

def create_retriever():
    vectorstore = get_vectorstore()
    base_retriever = vectorstore.as_retriever(search_kwargs={"k":10})
    re_ranker = CrossEncoderReranker(
        model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-v2-m3"),
        top_n=5
                                     
    )
    # return vectorstore.as_retriever(
    #     search_kwargs={
    #         "k": k,
    #         "fetch_k": 20,
    #         "ranker_type": "weighted",
    #         "ranker_params": {"weights": [dense_weight, sparse_weight]},
    #     }
    # )
    cross_encoder_reranker_retriever = ContextualCompressionRetriever(
        base_compressor = re_ranker,
        base_retriever = base_retriever,
    )
    return cross_encoder_reranker_retriever
if __name__ == "__main__":
    vs = get_vectorstore()
    print(vs.__dict__)