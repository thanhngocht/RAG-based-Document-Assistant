"""
Script to clean up documents stuck in 'processing' status
Run this when documents fail to complete due to service interruptions
"""
import asyncio
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.daos.document_dao import update_document
from app.database.mongo import init_mongo, close_mongo, get_database


async def cleanup_stuck_documents(hours_threshold: int = 1):
    """
    Find and mark documents stuck in 'processing' status as 'failed'
    
    Args:
        hours_threshold: Documents processing longer than this are considered stuck
    """
    print(f"Looking for documents stuck in 'processing' for more than {hours_threshold} hour(s)...")
    
    db = get_database()
    collection = db["documents"]
    
    # Calculate threshold time
    threshold_time = datetime.utcnow() - timedelta(hours=hours_threshold)
    
    # Find stuck documents
    stuck_docs = await collection.find({
        "status": "processing",
        "created_at": {"$lt": threshold_time}
    }).to_list(length=None)
    
    if not stuck_docs:
        print("✅ No stuck documents found!")
        return
    
    print(f"Found {len(stuck_docs)} stuck document(s):")
    
    for doc in stuck_docs:
        doc_id = str(doc["_id"])
        filename = doc.get("filename", "Unknown")
        created_at = doc.get("created_at", "Unknown")
        
        print(f"\n  📄 {filename}")
        print(f"     ID: {doc_id}")
        print(f"     Created: {created_at}")
        print(f"     Status: processing → failed")
        
        # Update to failed status
        await update_document(
            doc_id,
            {
                "status": "failed",
                "error_message": "Processing stuck - cleaned up by script",
            }
        )
    
    print(f"\n✅ Successfully cleaned up {len(stuck_docs)} document(s)")


async def list_processing_documents():
    """List all documents currently in processing status"""
    print("Documents currently in 'processing' status:")
    
    db = get_database()
    collection = db["documents"]
    
    processing_docs = await collection.find({"status": "processing"}).to_list(length=None)
    
    if not processing_docs:
        print("✅ No documents in processing status")
        return
    
    print(f"\nFound {len(processing_docs)} document(s):")
    for doc in processing_docs:
        filename = doc.get("filename", "Unknown")
        created_at = doc.get("created_at", "Unknown")
        doc_id = str(doc["_id"])
        
        # Calculate age
        if isinstance(created_at, datetime):
            age = datetime.utcnow() - created_at
            age_str = f"{age.total_seconds() / 60:.1f} minutes ago"
        else:
            age_str = "Unknown"
        
        print(f"\n  📄 {filename}")
        print(f"     ID: {doc_id}")
        print(f"     Created: {age_str}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Cleanup stuck documents")
    parser.add_argument(
        "--list",
        action="store_true",
        help="List documents in processing status"
    )
    parser.add_argument(
        "--cleanup",
        action="store_true",
        help="Clean up stuck documents"
    )
    parser.add_argument(
        "--hours",
        type=int,
        default=1,
        help="Consider documents stuck after this many hours (default: 1)"
    )
    
    args = parser.parse_args()
    
    async def main():
        # Initialize MongoDB (not async)
        init_mongo()
        
        try:
            if args.list:
                await list_processing_documents()
            elif args.cleanup:
                await cleanup_stuck_documents(args.hours)
            else:
                print("Usage:")
                print("  python cleanup_stuck_documents.py --list           # List processing documents")
                print("  python cleanup_stuck_documents.py --cleanup        # Clean up stuck documents")
                print("  python cleanup_stuck_documents.py --cleanup --hours 2  # Custom threshold")
        finally:
            # Close MongoDB connection
            await close_mongo()
    
    asyncio.run(main())
