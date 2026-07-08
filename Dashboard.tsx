
import React, { useEffect, useState } from 'react';
import { User, UserRole, DashboardStats, AttendanceRecord, ExamDate, Notification } from '../types';
import { db } from '../services/mockDatabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, UserX, Clock, AlertTriangle, Calendar, Bell, ShieldAlert, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  
  // Parent Specific State
  const [childUser, setChildUser] = useState<User | undefined>(undefined);
  const [childStats, setChildStats] = useState<{ totalClasses: number, attended: number, percentage: number } | null>(null);
  const [exams, setExams] = useState<ExamDate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Common Data
      const attData = await db.getAttendance();
      setAttendance(attData);

      if (user.role === UserRole.PARENT && user.childId) {
        // Fetch Child Specific Data
        const child = db.getUser(user.childId);
        setChildUser(child);
        const cStats = await db.getStudentStats(user.childId);
        setChildStats(cStats);
        const examData = await db.getExams();
        setExams(examData);
        const notifData = await db.getNotifications(user.id);
        setNotifications(notifData);
      } else {
        // Teacher/Admin Stats
        const statsData = await db.getStats();
        setStats(statsData);
      }
    };
    fetchData();
  }, [user]);

  // --- PARENT DASHBOARD ---
  if (user.role === UserRole.PARENT) {
    if (!childStats || !childUser) return <div className="p-8 text-center">Loading Child Data...</div>;

    const isDebarred = childStats.percentage < 75;
    const pieData = [
      { name: 'Present', value: childStats.attended },
      { name: 'Absent', value: childStats.totalClasses - childStats.attended },
    ];
    const COLORS = ['#10B981', '#EF4444'];

    return (
      <div className="space-y-6">
        {/* Parent Welcome */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold">Welcome, {user.name}</h2>
            <p className="opacity-90 mt-2">Here is the performance report for your child, <span className="font-semibold text-yellow-300">{childUser.name}</span>.</p>
          </div>
          
          {/* Debarred Status Card */}
          <div className={`px-6 py-4 rounded-xl flex items-center gap-4 shadow-lg border-2 ${isDebarred ? 'bg-red-500/20 border-red-400' : 'bg-green-500/20 border-green-400'}`}>
            {isDebarred ? <ShieldAlert className="w-10 h-10 text-red-200" /> : <CheckCircle className="w-10 h-10 text-green-200" />}
            <div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-80">Exam Eligibility</p>
              <h3 className="text-xl font-bold">{isDebarred ? 'DEBARRED WARNING' : 'ELIGIBLE'}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Attendance Overview
            </h3>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-800">{childStats.percentage}%</span>
                  <span className="text-xs text-gray-500">Attendance</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Present Days</span>
                <span className="font-bold text-green-600">{childStats.attended}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Absent Days</span>
                <span className="font-bold text-red-600">{childStats.totalClasses - childStats.attended}</span>
              </div>
              {isDebarred && (
                 <div className="p-3 bg-red-100 border border-red-200 rounded-lg flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-700 font-medium leading-tight">
                      Attendance is below 75%. Please meet the class teacher immediately to avoid debarment.
                    </p>
                 </div>
              )}
            </div>
          </div>

          {/* Exam Dates */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" /> Upcoming Exams
            </h3>
            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">{exam.subject}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">{exam.date}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{exam.time}</span>
                    <span>{exam.venue}</span>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <p className="text-gray-400 text-sm">No upcoming exams.</p>}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" /> Recent Alerts
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${notif.read ? 'border-gray-300 bg-gray-50' : 'border-indigo-500 bg-indigo-50'}`}>
                   <div className="flex justify-between items-center mb-1">
                     <h4 className={`text-sm font-semibold ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h4>
                     <span className="text-[10px] text-gray-400">{notif.date}</span>
                   </div>
                   <p className="text-xs text-gray-600">{notif.message}</p>
                </div>
              ))}
               {notifications.length === 0 && <p className="text-gray-400 text-sm">No new notifications.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEACHER / ADMIN DASHBOARD ---
  if (!stats) return <div className="animate-pulse flex space-x-4"><div className="h-10 bg-slate-200 rounded w-full"></div></div>;

  const chartData = [
    { name: 'Mon', present: 40, absent: 10 },
    { name: 'Tue', present: 42, absent: 8 },
    { name: 'Wed', present: 38, absent: 12 },
    { name: 'Thu', present: 45, absent: 5 },
    { name: 'Fri', present: stats.presentToday, absent: stats.absentToday },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold">Hello, {user.name}! 👋</h2>
        <p className="opacity-90 mt-2">Here is what's happening in your class today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.presentToday}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Absent Today</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.absentToday}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.attendanceRate}%</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Attendance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="present" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Live Activity</h3>
          <div className="space-y-4">
            {attendance.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full ${record.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{record.studentName}</p>
                  <p className="text-xs text-gray-500">
                    {record.status} • {record.method === 'FACE' ? 'Face Scan' : 'QR Scan'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
