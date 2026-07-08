
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { GeminiService } from '../services/geminiService';
import { ExportService } from '../services/exportService';
import { AttendanceRecord, DashboardStats } from '../types';
import { Download, Sparkles, Mail, AlertTriangle } from 'lucide-react';

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const attData = await db.getAttendance();
    const statsData = await db.getStats();
    setAttendance(attData);
    setStats(statsData);
  };

  const handleGenerateAIReport = async () => {
    if (!stats) return;
    setLoading(true);
    setAiReport('Generating insights from Gemini AI...');
    try {
      // Simulate taking top 10 recent records for context
      const report = await GeminiService.generateWeeklyReport(stats, attendance.slice(0, 10));
      setAiReport(report);
    } catch (e) {
      setAiReport('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Prepare data for export
    const exportData = attendance.map(rec => ({
      Date: rec.date,
      Time: new Date(rec.timestamp).toLocaleTimeString(),
      StudentID: rec.studentId,
      StudentName: rec.studentName,
      Status: rec.status,
      Method: rec.method
    }));
    ExportService.downloadCSV(exportData, 'Attendance_Report');
  };

  const handleNotifyParent = async (studentName: string, date: string) => {
    setNotificationStatus(`Drafting email for ${studentName}...`);
    const draft = await GeminiService.generateParentNotification(studentName, date);
    // In real app, this would open a modal or send via SMTP
    alert(`EMAIL DRAFT GENERATED:\n\n${draft}`);
    setNotificationStatus(null);
  };

  return (
    <div className="space-y-8">
      {/* AI Insight Section */}
      <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">AI Attendance Insights</h2>
          </div>
          <button
            onClick={handleGenerateAIReport}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/10"
          >
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </button>
        </div>
        
        <div className="bg-black/20 rounded-xl p-6 min-h-[100px] border border-white/5">
          {aiReport ? (
            <p className="leading-relaxed text-gray-200 whitespace-pre-line">{aiReport}</p>
          ) : (
            <p className="text-gray-400 italic text-center">
              Click "Generate Analysis" to let Gemini analyze attendance patterns and anomalies.
            </p>
          )}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Detailed Attendance Report</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg text-sm transition-colors border border-green-200 font-medium"
            >
              <Download className="w-4 h-4" /> Export to Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{record.studentName}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                      record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {record.method === 'FACE' ? 'Face ID' : record.method === 'QR' ? 'QR Code' : 'Manual'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status === 'ABSENT' && (
                      <button 
                        onClick={() => handleNotifyParent(record.studentName, record.date)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" /> Notify Parent
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {notificationStatus && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
           {notificationStatus}
        </div>
      )}
    </div>
  );
};
