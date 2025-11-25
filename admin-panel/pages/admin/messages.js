import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/router';

// Debug: Log Firestore instance
console.log('Admin Messages - Firestore instance:', db);

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/login');
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    // Debug: Log before setting up listener
    console.log('Setting up Firestore listener for messages');
    
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    
    // First load with getDocs to ensure we have data
    const loadInitialData = async () => {
      try {
        const querySnapshot = await getDocs(q);
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messagesData);
        setLoading(false);
        console.log('Initial messages loaded:', messagesData.length);
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };

    // Then set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messagesData);
        setLoading(false);
        console.log('Real-time update - messages count:', messagesData.length);
      },
      (error) => {
        console.error('Error in real-time listener:', error);
        setLoading(false);
      }
    );

    loadInitialData();

    return () => {
      console.log('Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [router]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const messageRef = doc(db, 'contacts', selectedMessage.id);
      console.log('Updating message:', messageRef.id, 'with reply:', replyText);
      
      await updateDoc(messageRef, {
        status: 'replied',
        reply: replyText,
        repliedAt: serverTimestamp(),
        repliedBy: localStorage.getItem('adminEmail') || 'Admin',
      });
      
      console.log('Message updated successfully');
      setReplyText('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please check console for details.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Messages ({messages.length})</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="p-4 text-gray-500">No messages yet.</p>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${message.status === 'new' ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{message.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{message.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      {message.status === 'replied' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Message from {selectedMessage.name}
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedMessage.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedMessage.status === 'replied' ? 'Replied' : 'New'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{selectedMessage.email}</p>
                {selectedMessage.phone && (
                  <p className="text-sm text-gray-500">{selectedMessage.phone}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Received: {formatDate(selectedMessage.createdAt)}
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Message:</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedMessage.message}</p>
                </div>

                {selectedMessage.status === 'replied' && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Your Reply:</h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(selectedMessage.repliedAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{selectedMessage.reply}</p>
                  </div>
                )}

                <form onSubmit={handleReply} className="mt-6">
                  <div>
                    <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">
                      {selectedMessage.status === 'replied' ? 'Update Reply' : 'Send Reply'}
                    </label>
                    <textarea
                      id="reply"
                      rows={4}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(null)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {selectedMessage.status === 'replied' ? 'Update Reply' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden h-full flex items-center justify-center">
              <div className="text-center p-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No message selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a message from the list to view details and reply.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageList;
