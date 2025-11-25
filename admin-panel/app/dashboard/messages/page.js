'use client';

import dynamic from 'next/dynamic';

// Import the AdminChat component with SSR disabled
const AdminChat = dynamic(
  () => import('@/components/AdminChat'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function AdminMessagesPage() {
  return (
    <div className="h-screen bg-gray-50">
      <AdminChat />
    </div>
  );
}
