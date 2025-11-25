import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function CustomerChat() {
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'existing'
  const messagesEndRef = useRef(null);
  
  const { 
    activeConversation, 
    setActiveConversation, 
    messages, 
    sendMessage, 
    startConversation,
    conversations,
    loading,
    error
  } = useChat();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      if (!activeConversation) {
        const newConversationId = await startConversation({
          ...userData,
          status: 'new',
        });
        setActiveConversation({ id: newConversationId });
      }
      
      await sendMessage(message, 'customer');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewConversation = () => {
    setActiveConversation(null);
    setActiveTab('new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // New conversation form or chat interface
  if (!activeConversation) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'new' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Conversation
          </button>
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'existing' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Conversations
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Start a New Conversation</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  placeholder="How can we help you today?"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !userData.name || !userData.email}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No previous conversations found.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveConversation({ id: conv.id })}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{conv.name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600">{conv.email}</p>
                        {conv.lastUpdated && (
                          <p className="text-xs text-gray-400 mt-1">
                            Last updated: {conv.lastUpdated.toDate().toLocaleString()}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        conv.status === 'new' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {conv.status === 'new' ? 'New' : 'Replied'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            {activeConversation.userName || 'Customer Support'}
          </h2>
          <p className="text-sm opacity-80">
            {activeConversation.email || 'We\'re here to help you!'}
          </p>
        </div>
        <button
          onClick={startNewConversation}
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition"
        >
          New Chat
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'admin'
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p 
                    className={`text-xs mt-1 ${
                      msg.sender === 'admin' ? 'text-gray-500' : 'text-blue-100'
                    }`}
                  >
                    {msg.timestamp?.toDate
                      ? msg.timestamp.toDate().toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
