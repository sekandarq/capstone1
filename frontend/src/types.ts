// src/types.ts

// Represents a student record, whether in class lists or in the top‐level students endpoint
export interface Student {
  id: number | string;
  name: string;
  studentId: string;
  department: string;
  email: string;
  password?: string;
  attendanceStatus?: string;

  compiler?: boolean;
  operating_system?: boolean;
}

// Represents a class with its roster of students
export interface ClassData {
  id: number;
  name: string;
  students: Student[];
}
