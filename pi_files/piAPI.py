from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
import numpy as np
from PIL import Image
from io import BytesIO
import face_recognition
import chromadb
import subprocess

app = FastAPI()

# Allow requests from frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChromaDB collection
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="students") #vector database name: students

class FaceRegisterRequest(BaseModel):
    student_id: str
    name: str
    image_base64: str

@app.post("/register")
async def register_face(data: FaceRegisterRequest):
    try:
        # Decode the base64 image
        if "," in data.image_base64:
            header, b64 = data.image_base64.split(",", 1)
        else:
            b64 = data.image_base64

        image_data = base64.b64decode(b64)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        image_np = np.array(image)

        # Encode face
        face_locations = face_recognition.face_locations(image_np)
        face_encodings = face_recognition.face_encodings(image_np, face_locations)

        if len(face_encodings) == 1:
            vector = face_encodings[0].tolist()
            collection.add(
                embeddings=[vector],
                ids=[data.student_id],
                metadatas=[{"name": data.name}]
            )
            return {"status": "success", "message": f"Registered {data.name}"}
        elif len(face_encodings) > 1:
            return {"status": "error", "message": "Multiple faces detected."}
        else:
            return {"status": "error", "message": "No face detected."}

    except Exception as e:
        return {"status": "error", "message": f"Failed to register face: {str(e)}"}

@app.post("/start-face-recognition/")
def start_recognition():
    try:
        subprocess.Popen(["python3", "face_recognition_script.py"])
        return {"status": "success", "message": "Face recognition started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}