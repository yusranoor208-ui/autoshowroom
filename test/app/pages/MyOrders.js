import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

export default function MyOrders() {
  const navigation = useNavigation();
  const auth = getAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      let querySnapshot;
      
      // Try with orderBy first, fallback to without if index is missing
      try {
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, query without orderBy and sort in memory
        console.log('Index not found, querying without orderBy');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid)
        );
        querySnapshot = await getDocs(q);
      }
      
      const ordersData = [];
      
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by createdAt if orderBy wasn't used (fallback)
      if (ordersData.length > 0) {
        ordersData.sort((a, b) => {
          const getDate = (order) => {
            if (order.createdAt?.toDate) {
              return order.createdAt.toDate();
            }
            if (order.createdAt) {
              return new Date(order.createdAt);
            }
            if (order.updatedAt?.toDate) {
              return order.updatedAt.toDate();
            }
            if (order.updatedAt) {
              return new Date(order.updatedAt);
            }
            return new Date(0);
          };
          return getDate(b) - getDate(a); // Descending order (newest first)
        });
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Handle ISO string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const renderOrderCard = (order) => {
    const isInstallment = order.payment?.method === 'installment';
    const firstItem = order.items?.[0];
    
    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>Order #{order.orderId || order.id}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItems}>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemImageContainer}>
                {item.image ? (
                  typeof item.image === 'number' ? (
                    <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
                  ) : typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('file://')) ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                  )
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="image-outline" size={30} color="#ccc" />
                  </View>
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>{item.type}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemColor}>Color: {item.color}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bank Details */}
        {order.bankDetails && (
          <View style={styles.bankInfo}>
            <View style={styles.bankHeader}>
              <MaterialCommunityIcons name="bank" size={20} color="#8e44ad" />
              <Text style={styles.bankTitle}>Payment Bank</Text>
            </View>
            <View style={styles.bankDetailsContent}>
              <Text style={styles.bankName}>{order.bankDetails.bankName}</Text>
              <Text style={styles.bankAccount}>Account: {order.bankDetails.accountNumber}</Text>
              {order.bankDetails.iban && order.bankDetails.iban !== 'N/A' && (
                <Text style={styles.bankIban}>IBAN: {order.bankDetails.iban}</Text>
              )}
              <Text style={styles.bankBranch}>Branch: {order.bankDetails.branch}</Text>
            </View>
            {order.paymentScreenshot && (
              <View style={styles.screenshotInfo}>
                <Ionicons name="image" size={16} color="#27ae60" />
                <Text style={styles.screenshotText}>Payment screenshot uploaded</Text>
              </View>
            )}
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          {isInstallment ? (
            <View style={styles.installmentInfo}>
              <View style={styles.installmentHeader}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#8e44ad" />
                <Text style={styles.installmentTitle}>Installment Plan</Text>
              </View>
              <View style={styles.installmentDetails}>
                <View style={styles.installmentRow}>
                  <Text style={styles.installmentLabel}>Monthly Payment:</Text>
                  <Text style={styles.installmentValue}>
                    PKR {order.payment?.monthlyAmount?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={styles.installmentRow}>
                  <Text style={styles.installmentLabel}>Duration:</Text>
                  <Text style={styles.installmentValue}>{order.payment?.months || 0} months</Text>
                </View>
                <View style={styles.installmentRow}>
                  <Text style={styles.installmentLabel}>Total Amount:</Text>
                  <Text style={styles.installmentTotal}>
                    PKR {order.payment?.totalAmount?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={styles.installmentRow}>
                  <Text style={styles.installmentLabel}>Paid:</Text>
                  <Text style={styles.installmentValue}>
                    PKR {order.payment?.paidAmount?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={styles.installmentRow}>
                  <Text style={styles.installmentLabel}>Remaining:</Text>
                  <Text style={styles.installmentRemaining}>
                    PKR {order.payment?.remainingAmount?.toLocaleString() || '0'}
                  </Text>
                </View>
                {order.payment?.nextPaymentDate && (
                  <View style={styles.installmentRow}>
                    <Text style={styles.installmentLabel}>Next Payment:</Text>
                    <Text style={styles.installmentValue}>
                      {formatDate(order.payment.nextPaymentDate)}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* View Installments Button */}
              {order.installmentsSchedule && order.installmentsSchedule.length > 0 && (
                <TouchableOpacity
                  style={styles.viewInstallmentsButton}
                  onPress={() => navigation.navigate('InstallmentsList', { orderId: order.id })}
                >
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#8e44ad" />
                  <Text style={styles.viewInstallmentsText}>View Installment Schedule</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8e44ad" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.fullPaymentInfo}>
              <Text style={styles.fullPaymentLabel}>Total Amount:</Text>
              <Text style={styles.fullPaymentAmount}>
                PKR {order.payment?.amount?.toLocaleString() || '0'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e44ad" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>Your orders will appear here</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.ordersList}>
            {orders.map((order) => renderOrderCard(order))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#8e44ad',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#8e44ad',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  itemType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  itemMeta: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  itemColor: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 15,
  },
  itemQty: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginTop: 5,
  },
  paymentInfo: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  installmentInfo: {
    backgroundColor: '#f8f0fc',
    borderRadius: 8,
    padding: 12,
  },
  installmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginLeft: 8,
  },
  installmentDetails: {
    marginTop: 5,
  },
  installmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  installmentLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  installmentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  installmentTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  installmentRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  fullPaymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullPaymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  fullPaymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  bankInfo: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8e44ad',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginLeft: 8,
  },
  bankDetailsContent: {
    marginTop: 5,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  bankAccount: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  bankIban: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  bankBranch: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  screenshotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
  },
  screenshotText: {
    fontSize: 13,
    color: '#27ae60',
    marginLeft: 5,
    fontWeight: '500',
  },
  viewInstallmentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f0fc',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#8e44ad',
  },
  viewInstallmentsText: {
    color: '#8e44ad',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
});

