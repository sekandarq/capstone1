import React from 'react';
import App from '../App'; // Import App to access mockStudents

interface Student {
  id: number;
  name: string;
  studentId: string;
  department: string;
  email: string;
}

interface StudentDashboardProps {
  mockStudents: Student[];
  onLogout: () => void;
}

function StudentDashboard({ mockStudents, onLogout }: StudentDashboardProps) {

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-red-800 border-r p-4">
        {/* Sidebar content */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white">Student Dashboard</h2>
          <ul className="mt-4">
            <li className="mb-2">
              <button className="w-full text-left px-4 py-2 rounded-md bg-blue-500 text-white">
                Profile
              </button>
            </li>
            <li className="mb-2">
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800">
                Face Registration
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 p-6">
        <div className="flex justify-end">
          <button onClick={onLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-4">
            Logout
          </button>
        </div>
        {/* Attendance Overview */}
        <div className="bg-white dark:bg-white shadow rounded-lg p-4 mb-8">
          <h2 className="text-2xl text-center font-bold tracking-tight mb-8">Student's Profile</h2>
          {/* Student Information */}
          <div>
            <p>Name: {mockStudents[0].name}</p>
            <p>Student ID: {mockStudents[0].studentId}</p>
            <p>Department: {mockStudents[0].department}</p>
            <p>Email: {mockStudents[0].email}</p>
          </div>
        </div>

        {/* Student Information */}

      </div>
    </div>
  );
}

export default StudentDashboard;