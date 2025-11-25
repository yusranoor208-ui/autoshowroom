// Admin helper functions for Firebase operations
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== PRODUCTS/VEHICLES ====================
export const getAllVehicles = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

export const addVehicle = async (vehicleData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...vehicleData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

export const updateVehicle = async (id, vehicleData) => {
  try {
    await updateDoc(doc(db, 'products', id), {
      ...vehicleData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicle = async (id) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

// ==================== ORDERS ====================
export const getAllOrders = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// ==================== USERS ====================
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// ==================== CATEGORIES ====================
export const getAllCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    await updateDoc(doc(db, 'categories', id), {
      ...categoryData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// ==================== TRANSACTIONS ====================
export const getAllTransactions = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// ==================== FEEDBACK ====================
export const getAllFeedback = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

export const updateFeedbackStatus = async (feedbackId, status) => {
  try {
    await updateDoc(doc(db, 'feedback', feedbackId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw error;
  }
};

// ==================== INSTALLMENTS ====================
export const getAllInstallments = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'installments'), orderBy('dueDate', 'asc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching installments:', error);
    throw error;
  }
};

export const updateInstallmentStatus = async (installmentId, status, paidAmount = 0) => {
  try {
    await updateDoc(doc(db, 'installments', installmentId), {
      status,
      paidAmount,
      paidAt: status === 'paid' ? Timestamp.now() : null,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating installment status:', error);
    throw error;
  }
};

// ==================== CHAT SUPPORT ====================
export const getAllChats = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendChatMessage = async (chatId, message, senderId) => {
  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: message,
      senderId,
      senderType: 'admin',
      timestamp: Timestamp.now(),
      read: false,
    });
    
    // Update last message in chat document
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: message,
      lastMessageAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const updateChatStatus = async (chatId, status) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating chat status:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId) => {
  try {
    const messagesSnapshot = await getDocs(
      collection(db, 'chats', chatId, 'messages')
    );
    const batch = writeBatch(db);
    
    messagesSnapshot.forEach((messageDoc) => {
      const messageData = messageDoc.data();
      if (messageData.senderType === 'customer' && !messageData.read) {
        batch.update(messageDoc.ref, { read: true });
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const getChatStatistics = async () => {
  try {
    const chatsSnapshot = await getDocs(collection(db, 'chats'));
    const chats = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalChats = chats.length;
    const activeChats = chats.filter(chat => chat.status === 'active' || chat.status === 'pending').length;
    
    // Calculate average response time (simplified - would need to track actual response times)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (const chat of chats) {
      if (chat.lastMessageAt) {
        const messagesSnapshot = await getDocs(
          query(
            collection(db, 'chats', chat.id, 'messages'),
            orderBy('timestamp', 'asc')
          )
        );
        const messages = messagesSnapshot.docs.map(doc => doc.data());
        
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].senderType === 'customer' && messages[i + 1].senderType === 'admin') {
            const responseTime = messages[i + 1].timestamp.toMillis() - messages[i].timestamp.toMillis();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      }
    }
    
    const avgResponseTime = responseCount > 0 
      ? Math.round((totalResponseTime / responseCount) / 60000 * 10) / 10 
      : 0;
    
    // Customer satisfaction (simplified - would need actual ratings)
    const customerSatisfaction = 89; // Placeholder
    
    return {
      totalChats,
      activeChats,
      avgResponseTime,
      customerSatisfaction,
    };
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    return {
      totalChats: 0,
      activeChats: 0,
      avgResponseTime: 0,
      customerSatisfaction: 0,
    };
  }
};

// ==================== NOTIFICATIONS ====================
export const getAllNotifications = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: Timestamp.now(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const sendBulkNotification = async (userIds, notificationData) => {
  try {
    const batch = writeBatch(db);
    
    userIds.forEach(userId => {
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        ...notificationData,
        userId,
        createdAt: Timestamp.now(),
        read: false,
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('read', '==', false)
    );
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async () => {
  try {
    const [users, orders, vehicles, transactions] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'transactions')),
    ]);

    const ordersData = orders.docs.map(doc => doc.data());
    const transactionsData = transactions.docs.map(doc => doc.data());

    return {
      totalUsers: users.size,
      totalOrders: orders.size,
      totalVehicles: vehicles.size,
      totalRevenue: transactionsData.reduce((sum, t) => sum + (t.amount || 0), 0),
      pendingOrders: ordersData.filter(o => o.status === 'pending').length,
      completedOrders: ordersData.filter(o => o.status === 'completed').length,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== RECENT ACTIVITY ====================
export const getRecentActivity = async () => {
  try {
    const activities = [];

    // Get recent orders
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        action: 'New order placed',
        type: 'order',
        timestamp: data.createdAt,
        details: data,
      });
    });

    // Get recent users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        action: 'New user registered',
        type: 'user',
        timestamp: data.createdAt,
        details: data,
      });
    });

    // Get recent vehicle updates
    const vehiclesQuery = query(
      collection(db, 'products'),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );
    const vehiclesSnapshot = await getDocs(vehiclesQuery);
    vehiclesSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        action: 'Vehicle updated',
        type: 'vehicle',
        timestamp: data.updatedAt,
        details: data,
      });
    });

    // Get recent transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        action: 'Payment received',
        type: 'payment',
        timestamp: data.createdAt,
        details: data,
      });
    });

    // Sort all activities by timestamp and return top 10
    return activities
      .sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      })
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};
