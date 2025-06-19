// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import classesData from './data/classes.json';
import type { Student, ClassData } from './types';

export const PI_SERVER = 'http://192.168.35.235:8000';

function App() {
  const [userRole, setUserRole] = useState<string | null>(() => {
  return localStorage.getItem('role');
});


  const handleLogin = (role: string) => {
    setUserRole(role);
    localStorage.setItem('role', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('role');
    localStorage.removeItem('currentStudent');
    
  };

  const classList = (classesData.classes as unknown) as ClassData[];

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/student"
          element={
            (userRole === 'student' || !!localStorage.getItem('currentStudent')) ? (
              <StudentDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/teacher"
          element={
            userRole === 'teacher' ? (
              <TeacherDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
