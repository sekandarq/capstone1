// src/components/MainDashboard.tsx
import React, { useState, useEffect } from 'react';

interface Student {
  id: number;
  name: string;
  studentId: string;
  department: string;
  email: string;
  attendanceStatus: string;
}

interface MainDashboardProps {
  studentId: string;
}

function MainDashboard({ studentId }: MainDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`http://localhost:4000/students?studentId=${studentId}`);
        const data = await response.json();

        if (data.length > 0) {
          setStudent(data[0]);
        } else {
          console.log('Student not found');
          setStudent(null);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        setStudent(null);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div>
      <h2>Main Dashboard</h2>
      <h3>Student Information</h3>
      <p>Name: {student.name}</p>
      <p>Student ID: {student.studentId}</p>
      <p>Attendance Status: {student.attendanceStatus}</p>
    </div>
  );
}

export default MainDashboard;
