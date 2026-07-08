
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  ScanFace, 
  QrCode, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  GraduationCap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentPage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT] },
    { id: 'students', label: 'Students & Mail', icon: GraduationCap, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'attendance-face', label: 'Face Attendance', icon: ScanFace, roles: [UserRole.STUDENT, UserRole.TEACHER] },
    { id: 'attendance-qr', label: 'QR Attendance', icon: QrCode, roles: [UserRole.STUDENT, UserRole.TEACHER] },
    { id: 'attendance-manual', label: 'Manual Entry', icon: Users, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'reports', label: 'AI Reports', icon: FileText, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-2 font-bold text-indigo-600">
          <ScanFace className="w-6 h-6" />
          <span>SAMS AI</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-2 font-bold text-2xl text-indigo-600 mb-8">
            <ScanFace className="w-8 h-8" />
            <span>SAMS AI</span>
          </div>

          <div className="flex items-center gap-3 p-3 mb-6 bg-indigo-50 rounded-xl">
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="overflow-hidden">
              <p className="font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-indigo-600 font-medium">{user.role}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={onLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center hidden md:flex">
          <h1 className="text-xl font-bold text-gray-800 capitalize">
            {currentPage.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
