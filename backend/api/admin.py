# backend/api/admin.py
from django.contrib import admin
from .models import Class, Student, Attendance

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'studentId', 'email', 'compiler', 'operating_system')
    list_filter = ('department', 'compiler', 'operating_system')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_room', 'week', 'session', 'status', 'timestamp')
    list_filter = ('week', 'session', 'status')
