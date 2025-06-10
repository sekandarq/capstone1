# new_faceRecognition.py
import face_recognition
import cv2
import numpy as np
from picamera2 import Picamera2
import time
import math
import mediapipe as mp
import chromadb
import argparse
import requests
from datetime import datetime

# Parse command line arguments
parser = argparse.ArgumentParser()
parser.add_argument("class_id", type=int)
parser.add_argument("week",     type=int)
parser.add_argument("session",  type=int)
args = parser.parse_args()

CLASS_ID = args.class_id
WEEK     = args.week
SESSION  = args.session

print(f"[INFO] Running for class {CLASS_ID}, week {WEEK}, session {SESSION}")


# Initialize ChromaDB and fetch known encodings
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("students") # retrieve collection from chromadb
print("[INFO] loading encodings from ChromaDB...")
data = collection.get(include=["embeddings", "metadatas"]) # get the data neeeded from the collection
known_face_encodings = data["embeddings"]
known_face_names = [meta.get("name", "Unknown") for meta in data["metadatas"]]

DJANGO_HOST = "http://192.168.35.166:8000/api" #laptop's IP

attendance_marked = set()  # Set to track marked students

# Mediapipe face mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
LEFT_EYE_LANDMARKS = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_LANDMARKS = [263, 387, 385, 362, 380, 373]

# PiCamera setup
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"format": 'XRGB8888', "size": (1280, 1080)}))
picam2.start()

cv_scaler = 4
SPOOF_TIMEOUT = 10
EAR_THRESHOLD = 0.2
YAW_THRESHOLD = 10
PITCH_THRESHOLD = 10

blink_total = 0
last_blink_time = time.time()
spoofing_flags = []
face_locations = []
face_encodings = []
face_names = []
frame_count = 0
start_time = time.time()
fps = 0

def euclidean(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def eye_aspect_ratio(landmarks, eye_indices):
    eye = [landmarks[i] for i in eye_indices]
    A = euclidean(eye[1], eye[5])
    B = euclidean(eye[2], eye[4])
    C = euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def get_head_pose(landmarks_2d, w, h):
    image_points = np.array([
        landmarks_2d[1],
        landmarks_2d[152],
        landmarks_2d[263],
        landmarks_2d[33],
        landmarks_2d[287],
        landmarks_2d[57],
    ], dtype="double")

    model_points = np.array([
        (0.0, 0.0, 0.0),
        (0.0, -63.6, -12.5),
        (43.3, 32.7, -26.0),
        (-43.3, 32.7, -26.0),
        (28.9, -28.9, -24.1),
        (-28.9, -28.9, -24.1)
    ])

    focal_length = w
    center = (w / 2, h / 2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]], dtype="double")

    dist_coeffs = np.zeros((4, 1))
    success, rvec, tvec = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs)
    rmat, _ = cv2.Rodrigues(rvec)
    proj_matrix = np.hstack((rmat, tvec))
    eulerAngles = cv2.decomposeProjectionMatrix(proj_matrix)[6]
    pitch, yaw, roll = [math.radians(_) for _ in eulerAngles]
    return math.degrees(pitch), math.degrees(yaw), math.degrees(roll)

def detect_blink_and_head_movement(frame_rgb):
    global blink_total, last_blink_time
    results = face_mesh.process(frame_rgb)
    if not results.multi_face_landmarks:
        return blink_total, 0, 0
    face_landmarks = results.multi_face_landmarks[0]
    h, w, _ = frame_rgb.shape
    landmarks_2d = [(int(pt.x * w), int(pt.y * h)) for pt in face_landmarks.landmark]

    left_EAR = eye_aspect_ratio(landmarks_2d, LEFT_EYE_LANDMARKS)
    right_EAR = eye_aspect_ratio(landmarks_2d, RIGHT_EYE_LANDMARKS)
    avg_EAR = (left_EAR + right_EAR) / 2.0

    if avg_EAR < EAR_THRESHOLD:
        blink_total += 1
        last_blink_time = time.time()

    pitch, yaw, _ = get_head_pose(landmarks_2d, w, h)
    return blink_total, pitch, yaw

def process_frame(frame, frame_count):
    global face_locations, face_encodings, face_names, spoofing_flags
    spoofing_flags.clear()
    resized_frame = cv2.resize(frame, (0, 0), fx=(1/cv_scaler), fy=(1/cv_scaler))
    rgb_resized = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)

    if frame_count % 3 == 0:
        face_locations[:] = face_recognition.face_locations(rgb_resized)
        face_encodings[:] = face_recognition.face_encodings(rgb_resized, face_locations, model='small')
        face_names[:] = []
    
    face_ids = []
    face_names = []

    blink_count, pitch, yaw = detect_blink_and_head_movement(rgb_resized)

    for encoding in face_encodings:
        status = "real"
        if (time.time() - last_blink_time > SPOOF_TIMEOUT) or (abs(yaw) < YAW_THRESHOLD and abs(pitch) < PITCH_THRESHOLD):
            status = "spoofing"

        if status != "real":
            spoofing_flags.append(status)
            face_names.append("Spoofing")
            continue

        # Only now do recognition
        matches = collection.query(query_embeddings=[encoding.tolist()], n_results=1)
        if matches["distances"] and matches["distances"][0][0] < 0.5:
            sid = matches["ids"][0][0]
            name = matches["metadatas"][0][0].get("name", "Unknown")
            face_ids.append(sid)
            face_names.append(name)
            spoofing_flags.append("real")
        else:
            face_names.append("Unknown")
            spoofing_flags.append("unknown")

            
    for sid, name, status in zip(face_ids, face_names, spoofing_flags):
        
        if name != "Unknown" and status == "real" and sid not in attendance_marked:
            # 1) build the payload
            url = f"{DJANGO_HOST}/face-recognition/mark-attendance/"
            timestamp = datetime.now().isoformat()
            payload = {
                "student_id":    sid,
                "class_id": CLASS_ID,
                "week":          WEEK,
                "session":       SESSION,
                "status":        "present",
                "timestamp":     timestamp,
                }

            # debug
            print(f"[DEBUG] Detected {name=} {status=}")
            print("[DEBUG] POST to:", url)
            print("[DEBUG] payload:", payload)
            
            # 2) fire the POST
            try:
                resp = requests.post(url, json=payload)
                print("[DEBUG] response:", resp.status_code,resp.text)
                if resp.ok:
                    attendance_marked.add(name)
                    attendance_marked.add(sid)
                else:
                    print(f"[WARN] could not mark {name}", resp.text)
                    
            except Exception as e:
                print(f"[ERROR] Attendance API unreachable: {e}")

    return frame

def draw_results(frame):
    for (top, right, bottom, left), name, status in zip(face_locations, face_names, spoofing_flags):
        top *= cv_scaler
        right *= cv_scaler
        bottom *= cv_scaler
        left *= cv_scaler
        box_color = (0, 255, 0) if status == "real" else (0, 255, 255) if status == "spoofing" else (0, 0, 255)
        label = name if status == "real" else f"{name}: {status}"
        cv2.rectangle(frame, (left, top), (right, bottom), box_color, 3)
        cv2.rectangle(frame, (left -3, top - 35), (right+3, top), box_color, cv2.FILLED)
        cv2.putText(frame, label, (left + 6, top - 6), cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 0, 0), 1)
    return frame

def calculate_fps():
    global frame_count, start_time, fps
    frame_count += 1
    elapsed_time = time.time() - start_time
    if elapsed_time > 1:
        fps = frame_count / elapsed_time
        frame_count = 0
        start_time = time.time()
    return fps

while True:
    frame_count += 1
    frame = picam2.capture_array()
    processed_frame = process_frame(frame, frame_count)
    display_frame = draw_results(processed_frame)
    current_fps = calculate_fps()
    cv2.putText(display_frame, f"FPS: {current_fps:.1f}", (display_frame.shape[1] - 150, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.imshow('Video', display_frame)
    if cv2.waitKey(1) == ord("q"):
        break

cv2.destroyAllWindows()
picam2.stop()