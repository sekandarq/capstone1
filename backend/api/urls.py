from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassViewSet, AttendanceViewSet, StudentViewSet, FaceRecognitionViewSet

router = DefaultRouter()
router.register(r'face-recognition', FaceRecognitionViewSet, basename='face-recognition')
router.register(r'classes', ClassViewSet)
router.register(r'attendances', AttendanceViewSet)
router.register(r'students', StudentViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
