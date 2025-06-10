# backend/api/serializers.py
from rest_framework import serializers
from .models import Class, Student, Attendance

class StudentNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'studentId', 'department', 'email']

class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentNestedSerializer()
    timestamp = serializers.DateTimeField(format='%I:%M %p')

    class Meta:
        model = Attendance
        fields = ['student', 'status', 'timestamp']

class ClassSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'students']

    def get_students(self, obj):
        if obj.name.lower() == 'compiler':
            students = Student.objects.filter(compiler=True)
        elif obj.name.lower() == 'operating system':
            students = Student.objects.filter(operating_system=True)
        else:
            students = Student.objects.none()
        return StudentNestedSerializer(students, many=True).data

class StudentSerializer(serializers.ModelSerializer):
    # include password write-only for registration
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Student
        fields = ['id', 'name', 'studentId', 'department', 'email', 'password', 'compiler', 'operating_system']

    def create(self, validated_data):
        # save password in plain text for authentication
        return super().create(validated_data)
