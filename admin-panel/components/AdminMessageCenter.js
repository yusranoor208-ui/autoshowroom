'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, Loader2 } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminMessageCenter() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load all chats
  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastActivity', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chatsList.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName || data.userEmail?.split('@')[0] || 'User',
          userEmail: data.userEmail || '',
          lastMessage: data.lastMessage || 'No messages yet',
          lastActivity: data.lastActivity,
          status: data.status || 'active',
          unreadCount: data.unreadCount || 0
        });
      });
      setChats(chatsList);
      setLoading(false);
      
      // Auto-select first chat if none selected
      if (!selectedChat && chatsList.length > 0) {
        setSelectedChat(chatsList[0]);
      }
    }, (error) => {
      console.error('Error loading chats:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = [];
      querySnapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesList);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error('Error loading messages:', error);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const unreadMessages = messages.filter(msg => msg.senderType === 'user' && !msg.read);
      if (unreadMessages.length > 0) {
        // Update unread count in chat document
        const chatRef = doc(db, 'chats', selectedChat.id);
        setDoc(chatRef, { unreadCount: 0 }, { merge: true });
      }
    }
  }, [selectedChat, messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      // Add message to Firestore
      const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
      await addDoc(messagesRef, {
        text: messageText,
        senderType: 'admin',
        senderId: 'admin',
        senderName: 'Support',
        timestamp: serverTimestamp(),
        read: false
      });

      // Update chat last activity
      const chatRef = doc(db, 'chats', selectedChat.id);
      await setDoc(chatRef, {
        lastActivity: serverTimestamp(),
        lastMessage: messageText,
        status: 'active',
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    return new Date(timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const filteredChats = chats.filter(chat => 
    chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow border border-gray-200">
      {/* Left sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Customer Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                    {chat.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {chat.status === 'active' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{chat.userName}</h3>
                    {chat.lastActivity && (
                      <span className="text-xs text-gray-500 ml-2">{formatDate(chat.lastActivity)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="ml-2 bg-purple-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right chat area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {selectedChat.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">{selectedChat.userName}</h3>
                <p className="text-xs text-gray-500">{selectedChat.userEmail}</p>
              </div>
            </div>
            {selectedChat.status === 'active' && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderType === 'admin'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderType === 'admin' ? 'text-purple-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="text-sm">Send</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}


