
import { User, UserRole, AttendanceRecord, ClassSession, DashboardStats, ExamDate, Notification } from '../types';

// --- MOCK DATABASE DATA ---

const MOCK_USERS: User[] = [
  // Admin
  { id: 'u1', name: 'Admin User', email: 'admin@school.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/200' },
  
  // Teachers
  { id: 't1', name: 'Rahul Sir', email: 'rahul@school.com', role: UserRole.TEACHER, subject: 'Digital Electronics', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
  { id: 't2', name: 'Pinki Ma’am', email: 'pinki@school.com', role: UserRole.TEACHER, subject: 'Advanced Engineering Mathematics', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pinki' },
  { id: 't3', name: 'Parul Ma’am', email: 'parul@school.com', role: UserRole.TEACHER, subject: 'Software Engineering', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parul' },

  // Students
  { id: 's1', name: 'Jatin Gupta', email: 'jatinjk@gmail.com', mobile: '7877795845', role: UserRole.STUDENT, classId: 'CSE-3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jatin' },
  { id: 's2', name: 'Gaurav Gupta', email: 'gaurav032612@gmail.com', mobile: '9588845165', role: UserRole.STUDENT, classId: 'CSE-3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaurav' },
  { id: 's3', name: 'Vishal Khuswaha', email: 'vishalkhuswaha1605@gmail.com', mobile: '9024660469', role: UserRole.STUDENT, classId: 'CSE-3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vishal' },

  // Parent
  { id: 'p1', name: 'Mr. Gupta', email: 'parent@gmail.com', role: UserRole.PARENT, childId: 's1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Papa' },
];

const MOCK_EXAMS: ExamDate[] = [
  { id: 'e1', subject: 'Digital Electronics (Mid-Term)', date: '2023-10-15', time: '10:00 AM', venue: 'Hall A' },
  { id: 'e2', subject: 'Adv. Eng. Mathematics (Final)', date: '2023-11-20', time: '02:00 PM', venue: 'Hall B' },
  { id: 'e3', subject: 'Software Engineering (Practical)', date: '2023-12-05', time: '09:00 AM', venue: 'Lab 3' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'p1', title: 'Absent Alert', message: 'Your ward Jatin Gupta was marked absent yesterday.', date: '2023-10-02', read: false },
  { id: 'n2', userId: 'p1', title: 'Fee Reminder', message: 'Please clear the tuition fees for Q4 by next week.', date: '2023-10-01', read: true },
  { id: 'n3', userId: 'p1', title: 'Exam Schedule Released', message: 'The mid-term datasheet has been published.', date: '2023-09-28', read: true },
];

// Generate last 14 days of attendance
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const students = MOCK_USERS.filter(u => u.role === UserRole.STUDENT);
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    students.forEach(student => {
      // Randomly mark some absent or late
      // Force Jatin (s1) to have lower attendance for demo purposes
      let presentProb = 0.8;
      if (student.id === 's1') presentProb = 0.65; // Make Jatin dangerously close to debarred

      const rand = Math.random();
      let status: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT';
      if (rand > presentProb) status = 'ABSENT';
      else if (rand > presentProb - 0.1) status = 'LATE';

      if (status !== 'ABSENT') {
        records.push({
          id: `att_${dateStr}_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          date: dateStr,
          timestamp: new Date().toISOString(),
          status: status,
          method: Math.random() > 0.5 ? 'FACE' : 'QR',
          verified: true,
        });
      }
    });
  }
  return records;
};

let MOCK_ATTENDANCE: AttendanceRecord[] = generateMockAttendance();

// --- API SIMULATION SERVICE ---

export const db = {
  login: async (email: string, password?: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, verify password here
        const user = MOCK_USERS.find(u => u.email === email);
        resolve(user || null);
      }, 800);
    });
  },

  getStats: async (): Promise<DashboardStats> => {
    const students = MOCK_USERS.filter(u => u.role === UserRole.STUDENT);
    const teachers = MOCK_USERS.filter(u => u.role === UserRole.TEACHER);
    const today = new Date().toISOString().split('T')[0];
    const presentToday = MOCK_ATTENDANCE.filter(r => r.date === today && r.status !== 'ABSENT').length;
    
    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      presentToday,
      absentToday: students.length - presentToday,
      attendanceRate: Math.round((presentToday / students.length) * 100) || 0,
    };
  },

  getStudentStats: async (studentId: string) => {
    const records = MOCK_ATTENDANCE.filter(r => r.studentId === studentId);
    const totalDays = 14; // Mocking a 2 week period for the calc
    const presentDays = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const percentage = Math.round((presentDays / totalDays) * 100);
    return {
      totalClasses: totalDays,
      attended: presentDays,
      percentage,
      records
    };
  },

  getExams: async () => MOCK_EXAMS,

  getNotifications: async (userId: string) => MOCK_NOTIFICATIONS.filter(n => n.userId === userId),

  getAttendance: async (classId?: string): Promise<AttendanceRecord[]> => {
    // In a real DB, we would filter by classId join
    return MOCK_ATTENDANCE.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  markAttendance: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord: AttendanceRecord = { ...record, id: `new_${Date.now()}` };
        // Remove existing record for same day/student if exists (upsert logic)
        MOCK_ATTENDANCE = MOCK_ATTENDANCE.filter(r => !(r.studentId === record.studentId && r.date === record.date));
        MOCK_ATTENDANCE.push(newRecord);
        resolve(newRecord);
      }, 1500); // Simulate network latency for AI/Face processing
    });
  },

  getStudents: () => MOCK_USERS.filter(u => u.role === UserRole.STUDENT),
  
  getUser: (id: string) => MOCK_USERS.find(u => u.id === id),
};
