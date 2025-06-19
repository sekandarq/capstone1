from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Student, Attendance, Class as ClassModel
from .serializers import ClassSerializer, AttendanceSerializer, StudentSerializer, MarkAttendanceSerializer
import base64
from io import BytesIO
from PIL import Image
import numpy as np
import face_recognition
import chromadb
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .auth import CsrfExemptSessionAuthentication


# ChromaDB setup
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="face_vector")

class ClassViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassModel.objects.all()
    serializer_class = ClassSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        class_id = self.request.query_params.get('class_id')
        week = self.request.query_params.get('week')
        session = self.request.query_params.get('session')
        if class_id is not None:
            qs = qs.filter(class_room_id=class_id)
        if week is not None:
            qs = qs.filter(week=week)
        if session is not None:
            qs = qs.filter(session=session)
        return qs

class StudentViewSet(viewsets.ModelViewSet):
    # Disable CSRF for this viewset
    authentication_classes = [CsrfExemptSessionAuthentication]
    # Allow any user to access this viewset
    permission_classes = [AllowAny]

    queryset = Student.objects.all()
    serializer_class = StudentSerializer


    def get_queryset(self):
        qs = super().get_queryset()
        email = self.request.query_params.get('email')
        if email is not None:
            qs = qs.filter(email=email)
        return qs

class FaceRecognitionViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def register_face(self, request):
        data = request.data
        try:
            # Validate required fields
            if not all(k in data for k in ("student_id", "name", "image_base64")):
                return Response(
                    {"status": "error", "message": "Missing student_id / name / image_base64"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            student_id = data["student_id"]
            name = data["name"]
            image_base64 = data["image_base64"]

            # Strip off "data:image/...;base64," prefix if present
            if "," in image_base64:
                header, b64 = image_base64.split(",", 1)
            else:
                b64 = image_base64

            image_data = base64.b64decode(b64)
            image = Image.open(BytesIO(image_data)).convert("RGB")
            image_np = np.array(image)

            face_locations = face_recognition.face_locations(image_np)
            face_encodings = face_recognition.face_encodings(image_np, face_locations)

            if len(face_encodings) == 1:
                vector = face_encodings[0].tolist()
                collection.add(
                    embeddings=[vector],
                    ids=[student_id],
                    metadatas=[{"name": name}],
                )
                return Response(
                    {"status": "success", "message": f"Registered {name}"},
                    status=status.HTTP_200_OK
                )
            elif len(face_encodings) > 1:
                return Response(
                    {"status": "error", "message": "Multiple faces detected."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {"status": "error", "message": "No face detected."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def list_faces(self, request):
        result = collection.get(include=["metadatas", "embeddings"])
        all_ids = result["ids"]
        all_metadatas = result["metadatas"]
        all_embeddings = result["embeddings"]

        out = []
        for sid, meta, vec in zip(all_ids, all_metadatas, all_embeddings):
            out.append({
                "student_id": sid,
                "metadata": meta,
                "vector": vec
            })

        return Response({"count": len(out), "entries": out}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='mark-attendance')
    @csrf_exempt  # Disable CSRF for this action
    def mark_attendance(self, request):
        """
        Expects JSON: {
           "student_id": "...",
           "class_id": 1,
           "week": 1,
           "session": 1,
           "status": "present",
           "timestamp": "2025-06-10T19:00:00"
        }
        """
        serializer = MarkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cd = serializer.validated_data

        student    = get_object_or_404(Student, studentId=cd['student_id'])
        class_room = get_object_or_404(ClassModel, id=cd['class_id'])

        att, created = Attendance.objects.get_or_create(
            student     = student,
            class_room  = class_room,
            week        = cd['week'],
            session     = cd['session'],
            defaults    = {
                'status':    cd['status'],
                'timestamp': cd['timestamp'],
            }
        )

        if created:
            return Response(
                {"status":"success","message":"Attendance recorded"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"status":"exists","message":"Attendance already recorded"},
                status=status.HTTP_200_OK
            )