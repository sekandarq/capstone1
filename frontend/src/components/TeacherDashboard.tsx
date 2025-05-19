// src/components/TeacherDashboard.tsx
import React, { useState } from 'react';

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

interface TeacherDashboardProps {
  classes: ClassData[];  
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ classes, onLogout }) => {
  // Start with the first class
  const [selectedClass, setSelectedClass] = useState<ClassData>(classes[0]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 text-white bg-white dark:bg-slate-900 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Classes</h2>
        <ul>
          {classes.map((cls) => (
            <li key={cls.name} className="mb-2">
              <button
                onClick={() => setSelectedClass(cls)}
                className={`w-full text-left px-4 py-2 rounded-md transition 
                  ${selectedClass.name === cls.name
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                {cls.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Area */}
      <div className="flex-1 p-6">
        {/* Logout */}
        <div className="flex justify-end mb-6">
          <button
            onClick={onLogout}
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </div>

        {/* Student Table */}
        <div>
          <h2 className="text-xl font-semibold mb-8">{selectedClass.name} Students List</h2>
          <table className="w-full bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Attendance Status</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {selectedClass.students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.studentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.attendanceStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
