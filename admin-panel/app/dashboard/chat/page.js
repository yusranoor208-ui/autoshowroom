'use client';

import AdminMessageCenter from '@/components/AdminMessageCenter';

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Customer Messages</h1>
      <AdminMessageCenter />
    </div>
  );
}
