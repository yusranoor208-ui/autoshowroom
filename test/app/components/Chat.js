import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const MessageBubble = ({ message, isUser }) => (
  <View style={[
    styles.messageBubble,
    isUser ? styles.userBubble : styles.adminBubble
  ]}>
    <Text style={isUser ? styles.userText : styles.adminText}>
      {message.text}
    </Text>
    <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
      {message.timestamp?.toDate ? 
        new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
        'Just now'}
    </Text>
  </View>
);

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      Alert.alert('Not Logged In', 'Please login to use chat');
      setLoading(false);
      return;
    }

    const uid = currentUser.uid;
    const email = currentUser.email || '';
    setUserId(uid);
    setUserEmail(email);

    // Initialize or get chat document
    const initializeChat = async () => {
      try {
        const chatRef = doc(db, 'chats', uid);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
          // Create chat document for this user
          await setDoc(chatRef, {
            userId: uid,
            userEmail: email,
            userName: currentUser.displayName || email.split('@')[0] || 'User',
            status: 'active',
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            unreadCount: 0
          });
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    // Set up real-time listener for messages
    const messagesRef = collection(db, 'chats', uid, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = [];
      querySnapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesList);
      setLoading(false);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, (error) => {
      console.error('Error listening to messages:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load messages');
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !userId || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      // Add message to Firestore
      const messagesRef = collection(db, 'chats', userId, 'messages');
      await addDoc(messagesRef, {
        text: messageText,
        senderType: 'user',
        senderId: userId,
        senderName: userEmail.split('@')[0] || 'User',
        timestamp: serverTimestamp(),
        read: false
      });

      // Update chat last activity
      const chatRef = doc(db, 'chats', userId);
      await setDoc(chatRef, {
        lastActivity: serverTimestamp(),
        status: 'active',
        lastMessage: messageText,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7b2ff7" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Please login to use chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="chatbubbles" size={24} color="#7b2ff7" />
            <Text style={styles.headerText}>Chat with Support</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation with our support team</Text>
            </View>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.senderType === 'user'}
              />
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!message.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#7b2ff7',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#7b2ff7',
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  adminText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
    color: '#000',
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7b2ff7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default Chat;
