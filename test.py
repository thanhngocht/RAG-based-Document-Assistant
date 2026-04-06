from pymilvus import MilvusClient

client = MilvusClient("http://localhost:19530")

res = client.query(
    collection_name="documents",
    filter="pk >= 0",
    limit=10,
    output_fields=["text"]
)

print(res)