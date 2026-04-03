#!/usr/bin/env python3
"""
Script để reset Milvus collection
Sử dụng: cd backend && python reset_milvus_now.py
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.milvus import get_milvus_client, reset_vectorstore
from app.config import settings

def main():
    print("=" * 60)
    print("🔄 RESET MILVUS COLLECTION")
    print("=" * 60)
    print(f"Collection name: {settings.collection_name}")
    print(f"Milvus endpoint: {settings.milvus_endpoint}")
    print()
    
    # Check if collection exists
    try:
        client = get_milvus_client()
        collection_exists = client.has_collection(settings.collection_name)
        
        if collection_exists:
            print(f"✅ Collection '{settings.collection_name}' exists")
            
            # Get collection stats
            stats = client.get_collection_stats(settings.collection_name)
            print(f"   Row count: {stats.get('row_count', 'N/A')}")
            print()
        else:
            print(f"⚠️  Collection '{settings.collection_name}' does not exist")
            print("   Nothing to reset.")
            return
    except Exception as e:
        print(f"❌ Error checking collection: {e}")
        return
    
    # Confirm
    print("⚠️  WARNING: This will DELETE ALL DATA in the collection!")
    confirm = input("Are you sure you want to continue? Type 'yes' to confirm: ")
    
    if confirm.lower() != 'yes':
        print("\n❌ Aborted. No changes made.")
        return
    
    print("\n🔄 Resetting collection...")
    
    try:
        # Reset vectorstore (drops collection and clears cache)
        reset_vectorstore()
        
        print("✅ Collection reset successfully!")
        print()
        print("📝 Next steps:")
        print("   1. Restart your FastAPI backend server")
        print("   2. Upload documents via API or UI")
        print("   3. New collection will be created with proper metadata fields")
        print()
        
    except Exception as e:
        print(f"❌ Error resetting collection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
