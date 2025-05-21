// src/components/TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClassData, Student } from '../types';

interface TeacherDashboardProps {
  onLogout: () => void;
}

const MAX_WEEKS = 16;

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);   // index 0 → Week 1-1, 1→1-2, 2→2-1, …
  const navigate = useNavigate();

  // Fetch classes
  useEffect(() => {
    fetch('http://localhost:4000/classes')
      .then(res => res.json())
      .then((data: ClassData[]) => {
        setClasses(data);
        if (data.length) setSelectedClass(data[0]);
      })
      .catch(console.error);
  }, []);

  // Fetch all registered students
  useEffect(() => {
    fetch('http://localhost:4000/students')
      .then(res => res.json())
      .then((data: Student[]) => setAllStudents(data))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  if (!selectedClass) {
    return <div>Loading classes…</div>;
  }

  // Filter only registered students for this class
  const displayed = allStudents.filter(s => s.classId === selectedClass.id);

  // Build labels: ["Week 1-1","Week 1-2","Week 2-1",…,"Week 16-2"]
  const tabs: string[] = [];
  for (let week = 1; week <= MAX_WEEKS; week++) {
    for (let session = 1; session <= 2; session++) {
      tabs.push(`Week ${week}-${session}`);
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4 border-b-2">Classes</h2>
        <ul className="space-y-2">
          {classes.map(cls => (
            <li key={cls.id}>
              <button
                onClick={() => setSelectedClass(cls)}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  selectedClass.id === cls.id
                    ? 'bg-blue-500'
                    : 'hover:bg-slate-600'
                }`}
              >
                {cls.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Area */}
      <div className="flex-1 bg-slate-100 p-6 overflow-auto">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => alert('Start Face Recognition Attendance')}
            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            Start Face Attendance
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          {selectedClass.name} – Student Attendance
        </h2>

        {/* ─── Tabs ──────────────────────────────────────────────────── */}
        <div className="flex overflow-x-auto space-x-2 mb-6 ">
          {tabs.map((label, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTab(idx)}
              className={`px-4 py-2 whitespace-nowrap rounded-md border
                ${selectedTab === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-blue-100'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── Student Table ────────────────────────────────────────── */}
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-slate-900">
            <tr>
              {['Name','Student ID','Department','Email','Attendance', 'Time'].map((h,i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayed.map(student => (
              <tr key={student.id} className="hover:bg-slate-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.name}</td>
                <td className="px-6 py-4">{student.studentId}</td>
                <td className="px-6 py-4">{student.department}</td>
                <td className="px-6 py-4">{student.email}</td>
                <td className="px-6 py-4">
                  {/* store attendanceStatus by week-session,
                      e.g. student.attendance[ selectedTab ] */}
                  {student.attendanceStatus || '—'}
                </td>
                <td className="px-6 py-4 text-sm"> --:-- </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherDashboard;
