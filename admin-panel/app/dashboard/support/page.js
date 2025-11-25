'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquare, User, Search, Send, Loader2, CheckCircle, Clock } from 'lucide-react';

export default function AdminChatSupport() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [adminStatus, setAdminStatus] = useState('online');
  const [notification, setNotification] = useState(null);

  // Set admin online status
  useEffect(() => {
    const updateAdminStatus = async () => {
      try {
        const adminRef = doc(db, 'admin', 'status');
        await updateDoc(adminRef, {
          isOnline: true,
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating admin status:', error);
      }
    };

    updateAdminStatus();

    // Set up beforeunload to mark admin as offline when leaving
    const handleBeforeUnload = async () => {
      try {
        const adminRef = doc(db, 'admin', 'status');
        await updateDoc(adminRef, {
          isOnline: false,
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating admin status on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Load conversations with unread counts
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('lastActivity', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chats = [];
      const newUnreadCounts = {};
      
      for (const doc of snapshot.docs) {
        const chatData = { id: doc.id, ...doc.data() };
        chats.push(chatData);
        
        // Get unread messages count
        const messagesRef = collection(db, 'chats', doc.id, 'messages');
        const unreadQuery = query(
          messagesRef,
          where('isAdmin', '==', false),
          where('read', '==', false)
        );
        
        const unreadSnapshot = await getDocs(unreadQuery);
        newUnreadCounts[doc.id] = unreadSnapshot.size;
        
        // Show notification for new messages
        if (unreadSnapshot.size > 0 && doc.data().lastActivity) {
          const lastActivity = doc.data().lastActivity.toDate();
          const now = new Date();
          const diffInMinutes = (now - lastActivity) / (1000 * 60);
          
          if (diffInMinutes < 2) { // Only show notification for recent messages
            setNotification({
              id: doc.id,
              customer: chatData.customerName || 'Customer',
              message: unreadSnapshot.docs[unreadSnapshot.docs.length - 1].data().text,
              timestamp: lastActivity
            });
            
            // Auto-hide notification after 5 seconds
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        }
      }
      
      setConversations(chats);
      setUnreadCounts(newUnreadCounts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load messages for selected chat and mark as read
  useEffect(() => {
    if (!selectedChat) return;

    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      let hasNewMessages = false;
      
      snapshot.forEach((doc) => {
        const msg = { id: doc.id, ...doc.data() };
        msgs.push(msg);
        if (!msg.isAdmin && !msg.read) {
          hasNewMessages = true;
        }
      });
      
      setMessages(msgs);
      
      // Mark messages as read if there are new ones
      if (hasNewMessages) {
        markMessagesAsRead(msgs);
      }
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [selectedChat.id]: 0
      }));
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const markMessagesAsRead = async (msgs) => {
    if (!selectedChat) return;
    
    try {
      const unreadMessages = msgs.filter(msg => !msg.isAdmin && !msg.read);
      
      for (const msg of unreadMessages) {
        const messageRef = doc(db, 'chats', selectedChat.id, 'messages', msg.id);
        await updateDoc(messageRef, { 
          read: true,
          readAt: serverTimestamp() 
        });
      }
      
      // Update the conversation's last read time
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastRead: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        isAdmin: true,
        senderName: 'Support',
        timestamp: serverTimestamp(),
        read: false
      });

      // Update chat last activity
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastActivity: serverTimestamp(),
        status: 'active',
        updatedAt: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    return new Date(timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '';
    return new Date(timestamp.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Notification component
  const Notification = () => {
    if (!notification) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs z-50">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              New message from {notification.customer}
            </p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Just now
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Notification />
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Customer Support</h1>
          <div className="mt-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No matching conversations' : 'No conversations yet'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => {
                const unreadCount = messages.filter(
                  msg => !msg.isAdmin && !msg.read
                ).length;
                
                return (
                  <li 
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedChat?.id === conversation.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedChat(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.customerName || 'Unknown User'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {conversation.lastActivity ? formatTime(conversation.lastActivity) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.customerEmail}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {conversation.lastMessage.text.length > 30 
                              ? `${conversation.lastMessage.text.substring(0, 30)}...` 
                              : conversation.lastMessage.text}
                          </p>
                        )}
                        <div className="flex items-center mt-1">
                          {unreadCounts[conversation.id] > 0 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium">
                              {unreadCounts[conversation.id]}
                            </span>
                          ) : conversation.status === 'waiting' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" /> Waiting
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" /> Active
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 text-xs text-gray-500">
                        {conversation.lastActivity ? formatDate(conversation.lastActivity) : ''}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-900">
                    {selectedChat.customerName || 'Customer'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.customerEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Online
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          message.isAdmin
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {!message.isAdmin && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {selectedChat.customerName || 'Customer'}
                          </p>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs opacity-70">
                            {message.timestamp ? formatTime(message.timestamp) : 'Just now'}
                          </p>
                          {message.isAdmin && (
                            <span className="text-xs text-blue-200 ml-2">
                              {message.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a conversation from the sidebar or wait for a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
