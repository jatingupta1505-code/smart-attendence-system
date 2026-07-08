
import React, { useState } from 'react';
import { User, UserRole } from './types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Reports } from './pages/Reports';
import { Students } from './pages/Students';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'students':
        return <Students />;
      case 'attendance-face':
        return <Attendance user={user} method="FACE" />;
      case 'attendance-qr':
        return <Attendance user={user} method="QR" />;
      case 'attendance-manual':
        return <div className="p-8 text-center text-gray-500">Manual Entry Module (Admin Only)</div>;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <div className="p-8 text-center text-gray-500">System Settings</div>;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
