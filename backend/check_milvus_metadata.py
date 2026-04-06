"""
Chạy script này trong backend environment để check metadata
"""
import sys
sys.path.insert(0, '/Users/ngochuynh/Desktop/RAG-based-Document-Assistant/backend')

from app.database.milvus import get_milvus_client, get_vectorstore

# 1. Get client
client = get_milvus_client()
collection_name = "rag_documents"

print("=" * 70)
print("MILVUS METADATA CHECK")
print("=" * 70)

# 2. Check collection exists
if client.has_collection(collection_name):
    print(f"\n✅ Collection '{collection_name}' exists\n")
    
    # 3. Get collection stats
    stats = client.get_collection_stats(collection_name)
    print(f"📊 Stats:")
    print(f"   Total documents: {stats.get('row_count', 0)}")
    
    # 4. Query sample data
    print(f"\n🔍 Sample documents with metadata:\n")
    
    results = client.query(
        collection_name=collection_name,
        filter="",  # No filter = get all
        output_fields=["text", "filename", "page", "heading", "document_id", "chunk_id"],
        limit=2
    )
    
    if results:
        for i, doc in enumerate(results, 1):
            print(f"--- Document {i} ---")
            print(f"  Text: {doc.get('text', '')[:80]}...")
            print(f"  Filename: {doc.get('filename', 'N/A')}")
            print(f"  Page: {doc.get('page', 'N/A')}")
            print(f"  Heading: {doc.get('heading', 'N/A')}")
            print(f"  Document ID: {doc.get('document_id', 'N/A')}")
            print(f"  Chunk ID: {doc.get('chunk_id', 'N/A')}")
            print()
    else:
        print("⚠️  Collection is empty - no documents uploaded yet\n")
        
else:
    print(f"\n❌ Collection '{collection_name}' does not exist\n")
    print("💡 Collection will be created when you upload the first document\n")

print("=" * 70)
print("\n💡 TIP: Metadata fields are DYNAMIC FIELDS")
print("   They don't appear in schema but are stored in each document")
print("=" * 70)
