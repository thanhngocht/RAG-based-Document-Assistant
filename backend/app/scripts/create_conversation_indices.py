"""
Script to create MongoDB indices for conversations and messages collections.
Run this once after deploying the conversation feature.
"""

import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


async def create_indices():
    print("Creating MongoDB indices...")
    
    # Connect directly
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.mongo_db]
    
    # Conversations collection indices
    conversations = db[settings.conversations_collection]
    
    # Index for fetching user's conversations sorted by last activity
    await conversations.create_index(
        [("user_id", 1), ("last_message_at", -1)],
        name="user_conversations_idx"
    )
    print("✅ Created index: user_conversations_idx")
    
    # Index for filtering by status
    await conversations.create_index(
        [("status", 1)],
        name="conversation_status_idx"
    )
    print("✅ Created index: conversation_status_idx")
    
    # Index for sorting by creation time
    await conversations.create_index(
        [("created_at", -1)],
        name="conversation_created_idx"
    )
    print("✅ Created index: conversation_created_idx")
    
    # Messages collection indices
    messages = db[settings.messages_collection]
    
    # Index for fetching conversation messages in order
    await messages.create_index(
        [("conversation_id", 1), ("created_at", 1)],
        name="conversation_messages_idx"
    )
    print("✅ Created index: conversation_messages_idx")
    
    # Index for user's messages
    await messages.create_index(
        [("role", 1)],
        name="message_role_idx"
    )
    print("✅ Created index: message_role_idx")
    
    print("\n✅ All indices created successfully!")
    
    # List all indices
    print("\n📋 Conversations indices:")
    async for index in conversations.list_indexes():
        print(f"  - {index['name']}")
    
    print("\n📋 Messages indices:")
    async for index in messages.list_indexes():
        print(f"  - {index['name']}")
    
    # Close connection
    client.close()


if __name__ == "__main__":
    asyncio.run(create_indices())
