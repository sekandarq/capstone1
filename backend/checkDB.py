import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection(name="face_vector")

results = collection.get(include=["metadatas", "embeddings"])

print(results)