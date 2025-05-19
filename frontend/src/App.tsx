// src/App.tsx
import React, { useState } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

import classesData from './data/classes.json'; 

interface Student {
  id: number;
  name: string;
  studentId: string;
  department: string;
  email: string;
  attendanceStatus: string; 
}

interface ClassData {
  name: string;
  students: Student[];
}

interface StudentDashboardProps {
  mockStudents: Student[];
  onLogout: () => void;
}

interface TeacherDashboardProps {
  classes: ClassData[];
  onLogout: () => void;
}

function App() {
  // This is the main application component.
  // It renders the Login component initially, and then either the StudentDashboard or the TeacherDashboard based on the user's role.

  const [userRole, setUserRole] = useState<string | null>(null);

  // classesData is imported from a JSON file
  const classes: ClassData[] = classesData as ClassData[];

  const handleLogin = (role: string) => {
    console.log("handleLogin called with role:", role); // Add this line
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  // Conditional Rendering based on userRole
  if (userRole === 'student') {
    return <StudentDashboard mockStudents={classes[0].students} onLogout={handleLogout} />;
  } else if (userRole === 'teacher') {
    return <TeacherDashboard classes={classes} onLogout={handleLogout} />;
  } else {
    return (
      <Login onLogin={handleLogin} />
    );
  }
}

export default App;