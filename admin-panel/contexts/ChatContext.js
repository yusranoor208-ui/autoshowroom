import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, or } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch all conversations for admin
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'conversations'),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = [];
      snapshot.forEach((doc) => {
        conversationsData.push({ id: doc.id, ...doc.data() });
      });
      setConversations(conversationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const q = query(
      collection(db, 'conversations', activeConversation.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    });

    return () => unsubscribe();
  }, [activeConversation]);

  // Start a new conversation (customer side)
  const startConversation = async (userData) => {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        ...userData,
        status: 'new',
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  };

  // Send a message
  const sendMessage = async (text, senderType = 'customer') => {
    if (!activeConversation || !text.trim()) return;

    try {
      await addDoc(collection(db, 'conversations', activeConversation.id, 'messages'), {
        text,
        sender: senderType === 'admin' ? 'admin' : 'customer',
        timestamp: serverTimestamp(),
      });

      // Update conversation last updated time
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastUpdated: serverTimestamp(),
        status: senderType === 'admin' ? 'replied' : 'waiting',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Update conversation status (admin side)
  const updateConversationStatus = async (status) => {
    if (!activeConversation) return;
    
    try {
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        status,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  };

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    error,
    startConversation,
    sendMessage,
    updateConversationStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
