import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../types';
import { db } from '../services/mockDatabase';
import { GeminiService } from '../services/geminiService';
import { ExportService } from '../services/exportService';
import { Mail, Download, Search, Sparkles, X, Send, Phone } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  studentId: string;
  records: AttendanceRecord[];
}

const StudentTrendSparkline: React.FC<SparklineProps> = ({ studentId, records }) => {
  const trendData = React.useMemo(() => {
    const today = new Date();
    // Generate last 5 days (ascending: oldest to newest)
    const targetDays = Array.from({ length: 5 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (4 - idx));
      return d;
    });

    return targetDays.map(targetDate => {
      let presentCount = 0;
      const totalDays = 14;

      for (let i = 0; i < totalDays; i++) {
        const windowDate = new Date(targetDate);
        windowDate.setDate(targetDate.getDate() - i);
        const windowDateStr = windowDate.toISOString().split('T')[0];

        const record = records.find(r => r.studentId === studentId && r.date === windowDateStr);
        if (record && (record.status === 'PRESENT' || record.status === 'LATE')) {
          presentCount++;
        }
      }

      const percentage = Math.round((presentCount / totalDays) * 100);
      return {
        day: targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        percentage: percentage,
      };
    });
  }, [studentId, records]);

  const latestPercentage = trendData[trendData.length - 1]?.percentage || 0;
  
  // Decide stroke color based on percentage
  const strokeColor = latestPercentage < 75 ? '#ef4444' : latestPercentage < 85 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-8 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-gray-700 font-medium">
                      {payload[0].payload.day}: <span className="font-bold">{payload[0].value}%</span>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '2 2' }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ r: 1.5, fill: strokeColor }}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
        latestPercentage < 75 ? 'bg-red-50 text-red-700' : latestPercentage < 85 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
      }`}>
        {latestPercentage}%
      </span>
    </div>
  );
};

export const Students: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Email Modal State
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [emailTopic, setEmailTopic] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = db.getStudents();
        setStudents(data);
        const attendanceData = await db.getAttendance();
        setAttendanceRecords(attendanceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = () => {
    // Flatten data for nice Excel format
    const exportData = students.map(s => ({
      ID: s.id,
      Name: s.name,
      Mobile: s.mobile,
      Email: s.email,
      Role: s.role,
      Class: s.classId || 'N/A'
    }));
    ExportService.downloadCSV(exportData, 'Student_List_Export');
  };

  const openEmailModal = (student: User) => {
    setSelectedStudent(student);
    setEmailTopic('');
  };

  const closeEmailModal = () => {
    setSelectedStudent(null);
  };

  const handleSendEmail = async (useAI: boolean) => {
    if (!selectedStudent) return;

    let subject = "Update from School";
    let body = emailTopic;

    if (useAI) {
      setIsGeneratingEmail(true);
      try {
        const aiResponse = await GeminiService.generateStudentEmail(selectedStudent.name, emailTopic || "General Check-in");
        subject = aiResponse.subject;
        body = aiResponse.body;
      } catch (e) {
        alert("AI Generation failed, falling back to manual.");
      } finally {
        setIsGeneratingEmail(false);
      }
    }

    // Open System Mail Client
    const mailtoLink = `mailto:${selectedStudent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    closeEmailModal();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading Student Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Directory</h2>
          <p className="text-gray-500">Manage students, export data, and send updates.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      {/* Search Bar (Visual Only for Demo) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search students by name or ID..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Performance Trend</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={student.avatar} alt="" className="w-10 h-10 rounded-full" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                     <Phone className="w-3 h-3" /> {student.mobile || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-gray-500">{student.classId}</td>
                  <td className="px-6 py-4">
                    <StudentTrendSparkline studentId={student.id} records={attendanceRecords} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEmailModal(student)}
                      className="text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Send Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Composer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Email to {selectedStudent.name}</h3>
              <button onClick={closeEmailModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Topic / Context</label>
                <textarea 
                  value={emailTopic}
                  onChange={(e) => setEmailTopic(e.target.value)}
                  placeholder="e.g. Missing assignment, Excellent performance, Reminder for tomorrow..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSendEmail(true)}
                  disabled={isGeneratingEmail || !emailTopic}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isGeneratingEmail ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  Generate with AI & Send
                </button>
                <button
                  onClick={() => handleSendEmail(false)}
                  disabled={isGeneratingEmail}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Manual
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">AI will draft a professional email and open your default mail client.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};