"""
Script để kiểm tra metadata trong Milvus
"""
from pymilvus import MilvusClient

# Kết nối
client = MilvusClient(uri="http://localhost:19530")

collection_name = "rag_documents"

# 1. Check collection info
if client.has_collection(collection_name):
    print(f"✅ Collection '{collection_name}' exists")
    
    # 2. Get stats
    stats = client.get_collection_stats(collection_name)
    print(f"\n📊 Collection stats:")
    print(f"   Row count: {stats['row_count']}")
    
    # 3. Query sample data to see metadata
    print(f"\n🔍 Sample documents with metadata:")
    results = client.query(
        collection_name=collection_name,
        filter="",
        output_fields=["text", "filename", "page", "heading", "document_id", "chunk_id"],
        limit=3
    )
    
    if results:
        for i, doc in enumerate(results, 1):
            print(f"\n--- Document {i} ---")
            print(f"Text: {doc.get('text', '')[:100]}...")
            print(f"Filename: {doc.get('filename')}")
            print(f"Page: {doc.get('page')}")
            print(f"Heading: {doc.get('heading')}")
            print(f"Document ID: {doc.get('document_id')}")
            print(f"Chunk ID: {doc.get('chunk_id')}")
    else:
        print("⚠️  No documents found (collection might be empty)")
        
else:
    print(f"❌ Collection '{collection_name}' does not exist")
    
