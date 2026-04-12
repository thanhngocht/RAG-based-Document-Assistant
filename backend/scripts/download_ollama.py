import os
import time

import ollama

print("Loading Ollama model...")
model_name = os.environ.get("MODEL_NAME")
embedding_model = os.environ.get("EMBEDDING_MODEL")
ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

if not model_name or not embedding_model:
    raise RuntimeError("MODEL_NAME and EMBEDDING_MODEL must be set")

client = ollama.Client(host=ollama_host)

for attempt in range(1, 31):
    try:
        client.ps()
        break
    except Exception:
        if attempt == 30:
            raise RuntimeError(f"Ollama is not reachable at {ollama_host}")
        time.sleep(2)

client.pull(model_name)
client.pull(embedding_model)

print("Done")
