
import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { User } from '../types';
import { ScanFace, UserCircle, Fingerprint, Lock, Mail, Eye, EyeOff, Baby } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    await handleAuth(email);
  };

  const handleAuth = async (loginEmail: string) => {
    setLoading(true);
    setError('');
    try {
      const user = await db.login(loginEmail);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (e) {
      setError('Login failed due to a system error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Hero / Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">SAMS AI</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
               <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Forgot Password?</a>
            </div>

            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <a href="#" className="font-semibold text-indigo-600 hover:underline">Contact Admin</a>
          </p>
        </div>

        {/* Right Side - Quick Access / Branding */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 md:p-12 flex flex-col justify-center border-l border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Quick Demo Access</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleAuth('parent@gmail.com')}
              className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Baby className="w-5 h-5 text-purple-600 group-hover:text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-gray-800">Parent Demo</p>
                <p className="text-xs text-gray-500">View Child Stats</p>
              </div>
            </button>

            <button
              onClick={() => handleAuth('rahul@school.com')}
              className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
            >
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <UserCircle className="w-5 h-5 text-green-600 group-hover:text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-gray-800">Teacher Demo</p>
                <p className="text-xs text-gray-500">Manage Attendance</p>
              </div>
            </button>

            <button
              onClick={() => handleAuth('jatinjk@gmail.com')}
              className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ScanFace className="w-5 h-5 text-blue-600 group-hover:text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-gray-800">Student Demo</p>
                <p className="text-xs text-gray-500">Mark Attendance</p>
              </div>
            </button>
          </div>
          
          <div className="mt-12 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 text-sm">System Update</h4>
            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
              New Parent Dashboard is now live. Parents can check exam dates and debarred status directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
