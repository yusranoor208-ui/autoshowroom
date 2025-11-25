'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  FolderTree,
  Users,
  CreditCard,
  MessageSquare,
  Calendar,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Car, label: 'Vehicles', href: '/dashboard/vehicles' },
  { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
  { icon: FolderTree, label: 'Categories', href: '/dashboard/categories' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: CreditCard, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: MessageSquare, label: 'Feedback', href: '/dashboard/feedback' },
  { icon: Calendar, label: 'Installments', href: '/dashboard/installments' },
  { icon: MessageCircle, label: 'Chat', href: '/dashboard/chat' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/login');
  };

  return (
    <>
      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        nav::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a78bfa, #818cf8);
          border-radius: 10px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #8b5cf6, #6366f1);
        }
      `}</style>
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 shadow-2xl h-screen fixed left-0 top-0 transition-all duration-300 z-50 flex flex-col`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Header - Fixed */}
        <div className="p-6 border-b border-purple-700 flex-shrink-0">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-purple-300 mt-0.5">Vehicle Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 pb-24">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105'
                        : 'text-purple-200 hover:bg-purple-700/50 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t border-purple-700 bg-purple-900/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 w-full transition-all border border-red-400/30`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
