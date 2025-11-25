'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { getUnreadNotificationCount } from '@/lib/adminHelper';

export default function Header({ isCollapsed }) {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    const name = localStorage.getItem('adminName') || 'Admin';
    if (email) {
      setAdminEmail(email);
    }
    setAdminName(name);
    loadNotificationCount();
    
    // Refresh notification count every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setNotificationCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/login');
  };

  return (
    <header className={`bg-white shadow-md h-16 fixed top-0 right-0 ${isCollapsed ? 'left-20' : 'left-64'} z-40 border-b border-gray-200 transition-all duration-300`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome back, {adminName}
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">{adminEmail}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button 
            onClick={() => router.push('/dashboard/notifications')}
            className="relative p-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-purple-100 hover:border-purple-300 hover:shadow-md"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {notificationCount}
                </span>
              </>
            )}
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{adminName}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{adminName}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{adminEmail}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-3 transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-600" />
                  Settings
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </header>
  );
}
 