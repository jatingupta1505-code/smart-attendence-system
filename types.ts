
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  classId?: string; // For students and teachers
  subject?: string; // For teachers
  mobile?: string; // For students
  childId?: string; // For parents
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // ISO Date YYYY-MM-DD
  timestamp: string; // ISO Time
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  method: 'FACE' | 'QR' | 'MANUAL';
  verified: boolean;
}

export interface ClassSession {
  id: string;
  name: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}

export interface ExamDate {
  id: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}
