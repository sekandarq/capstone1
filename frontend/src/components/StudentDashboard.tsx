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
      <aside className="w-64 bg-white dark:bg-red-800 border-r">
        {/* Sidebar content */}
      </aside>

      {/* Main Area */}
      <div className="flex-1 p-6">
        <div className="flex justify-end">
          <button onClick={onLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-4">
            Logout
          </button>
        </div>
        {/* Attendance Overview */}
        <div className="bg-white dark:bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Attendance Overview</h2>
          {/* Attendance Overview content */}
        </div>

        {/* Upcoming Classes Table */}
        <div className="bg-white dark:bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Upcoming Classes</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Lecturer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50 dark:bg-slate-700">
                <td>05/19/2025</td>
                <td>Math</td>
                <td>Dr. Smith</td>
              </tr>
              <tr>
                <td>05/20/2025</td>
                <td>Science</td>
                <td>Mr. Jones</td>
              </tr>
              {/* Add more rows */}
            </tbody>
          </table>
        </div>

        {/* Student Information */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Student Information</h2>
          <p>Name: {mockStudents[0].name}</p>
          <p>Student ID: {mockStudents[0].studentId}</p>
          <p>Department: {mockStudents[0].department}</p>
          <p>Email: {mockStudents[0].email}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
