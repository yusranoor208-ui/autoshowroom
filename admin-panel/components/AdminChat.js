'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, MessageSquare, User, Send, ArrowLeft, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOnline, setIsAdminOnline] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  // Set admin online status
  useEffect(() => {
    const updateAdminStatus = async () => {
      try {
        const adminRef = doc(db, 'admin', 'status');
        await updateDoc(adminRef, {
          isOnline: true,
          lastActive: serverTimestamp()
        });
        
        // Set up listener for admin status
        const unsubscribe = onSnapshot(adminRef, (doc) => {
          if (doc.exists()) {
            setIsAdminOnline(doc.data().isOnline || false);
          }
        });

        // Update status on window close or page hide
        const handleBeforeUnload = () => {
          updateDoc(adminRef, {
            isOnline: false,
            lastActive: serverTimestamp()
          });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
          unsubscribe();
          window.removeEventListener('beforeunload', handleBeforeUnload);
          updateDoc(adminRef, {
            isOnline: false,
            lastActive: serverTimestamp()
          });
        };
      } catch (error) {
        console.error('Error updating admin status:', error);
      }
    };

    updateAdminStatus();
  }, []);

  // Load conversations
  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      orderBy('lastActivity', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationsData = [];
      const unreads = {};
      
      for (const doc of snapshot.docs) {
        const data = { id: doc.id, ...doc.data() };
        conversationsData.push(data);
        
        // Get unread count for each conversation
        const messagesRef = collection(db, 'chats', doc.id, 'messages');
        const unreadQuery = query(
          messagesRef,
          where('isAdmin', '==', false),
          where('read', '==', false)
        );
        
        const unreadSnapshot = await getDocs(unreadQuery);
        unreads[doc.id] = unreadSnapshot.size;
      }
      
      setConversations(conversationsData);
      setUnreadCounts(unreads);
      setIsLoading(false);
      
      // If no conversation is selected, select the first one
      if (!selectedConversation && conversationsData.length > 0) {
        selectConversation(conversationsData[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const messagesRef = collection(db, 'chats', selectedConversation.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      
      // Mark messages as read
      markMessagesAsRead(selectedConversation.id, messagesData);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read when conversation is selected
    markMessagesAsRead(conversation.id, messages);
  };

  const markMessagesAsRead = async (conversationId, msgs) => {
    try {
      const unreadMessages = msgs.filter(
        msg => !msg.isAdmin && !msg.read
      );

      if (unreadMessages.length > 0) {
        const batch = [];
        unreadMessages.forEach(msg => {
          const messageRef = doc(db, 'chats', conversationId, 'messages', msg.id);
          batch.push(updateDoc(messageRef, { read: true }));
        });

        await Promise.all(batch);
        
        // Update unread counts
        setUnreadCounts(prev => ({
          ...prev,
          [conversationId]: 0
        }));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Add message to chat
      await addDoc(collection(db, 'chats', selectedConversation.id, 'messages'), {
        text: newMessage,
        isAdmin: true,
        senderName: 'Support',
        read: false,
        timestamp: serverTimestamp()
      });

      // Update conversation last activity
      await updateDoc(doc(db, 'chats', selectedConversation.id), {
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
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
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
              {searchTerm ? 'No matching conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => {
                const isActive = selectedConversation?.id === conversation.id;
                const unreadCount = unreadCounts[conversation.id] || 0;
                const lastMessageTime = conversation.lastActivity 
                  ? formatTime(conversation.lastActivity)
                  : '';
                
                return (
                  <li 
                    key={conversation.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : ''}`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.customerName || 'Unknown User'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 ml-2">
                            {lastMessageTime}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.customerEmail}
                        </p>
                        <div className="flex items-center mt-1">
                          {conversation.status === 'waiting' ? (
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
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-900">
                    {selectedConversation.customerName || 'Customer'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.customerEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isAdminOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <span className={`h-2 w-2 rounded-full mr-1 ${
                    isAdminOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  {isAdminOnline ? 'Online' : 'Offline'}
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
                        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-2 rounded-lg ${
                          message.isAdmin
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {!message.isAdmin && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {selectedConversation.customerName || 'Customer'}
                          </p>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs opacity-70">
                            {message.timestamp?.toDate
                              ? formatTime(message.timestamp)
                              : 'Just now'}
                          </p>
                          {message.isAdmin && (
                            <span className="text-xs text-blue-300 ml-2">
                              {message.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
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
                Select a conversation from the sidebar or start a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
