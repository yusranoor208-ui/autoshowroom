import { useRouter } from 'next/router';
import { useState } from 'react';

export default function NewChat() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateChat = async () => {
    setLoading(true);
    // Add your chat creation logic here
    setTimeout(() => {
      setLoading(false);
      router.push('/admin/messages');
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">New Chat</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Create a new chat conversation</p>
        <button
          onClick={handleCreateChat}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Chat'}
        </button>
      </div>
    </div>
  );
}

