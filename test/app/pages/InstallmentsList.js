import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

export default function InstallmentsList() {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { orderId } = route.params || {};

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        setOrder({
          id: orderSnap.id,
          ...orderSnap.data()
        });
      } else {
        Alert.alert('Error', 'Order not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  };

  const isOverdue = (dueDate, status) => {
    return status === 'pending' && isDue(dueDate);
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'paid') return '#27ae60';
    if (isOverdue(dueDate, status)) return '#e74c3c';
    if (status === 'pending') return '#f39c12';
    return '#3498db';
  };

  const getStatusText = (status, dueDate) => {
    if (status === 'paid') return 'Paid';
    if (isOverdue(dueDate, status)) return 'Overdue';
    if (status === 'pending') return 'Due';
    return 'Upcoming';
  };

  const handleInstallmentPress = (installment) => {
    // Only allow payment for pending/overdue installments
    if (installment.status === 'paid') {
      Alert.alert('Already Paid', 'This installment has already been paid.');
      return;
    }

    // Navigate to payment page
    navigation.navigate('InstallmentPayment', {
      orderId: order.id,
      installment: installment,
      bankDetails: order.bankDetails
    });
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
          <Text style={styles.headerTitle}>Installments</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e44ad" />
          <Text style={styles.loadingText}>Loading installments...</Text>
        </View>
      </View>
    );
  }

  if (!order || !order.installmentsSchedule || order.installmentsSchedule.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Installments</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-clock" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No installments found</Text>
        </View>
      </View>
    );
  }

  const installments = order.installmentsSchedule || [];
  const paidCount = installments.filter(i => i.status === 'paid').length;
  const totalCount = installments.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Installments</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Installments:</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Paid:</Text>
            <Text style={[styles.summaryValue, { color: '#27ae60' }]}>
              {paidCount} / {totalCount}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Amount:</Text>
            <Text style={styles.summaryValue}>
              PKR {order.payment?.monthlyAmount?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }]}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={[styles.summaryValue, { fontWeight: 'bold', color: '#8e44ad' }]}>
              PKR {order.payment?.totalAmount?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        {/* Installments List */}
        <View style={styles.installmentsList}>
          <Text style={styles.listTitle}>Installment Schedule</Text>
          {installments.map((installment, index) => {
            const statusColor = getStatusColor(installment.status, installment.dueDate);
            const statusText = getStatusText(installment.status, installment.dueDate);
            const canPay = installment.status !== 'paid' && isDue(installment.dueDate);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.installmentCard,
                  canPay && styles.installmentCardDue,
                  installment.status === 'paid' && styles.installmentCardPaid
                ]}
                onPress={() => handleInstallmentPress(installment)}
                disabled={installment.status === 'paid'}
              >
                <View style={styles.installmentHeader}>
                  <View style={styles.installmentNumber}>
                    <Text style={styles.installmentNumberText}>
                      #{installment.installmentNumber}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                  </View>
                </View>

                <View style={styles.installmentBody}>
                  <View style={styles.installmentRow}>
                    <MaterialCommunityIcons name="calendar" size={18} color="#7f8c8d" />
                    <Text style={styles.installmentDate}>
                      Due: {formatDate(installment.dueDate)}
                    </Text>
                  </View>

                  <View style={styles.installmentRow}>
                    <MaterialCommunityIcons name="currency-usd" size={18} color="#7f8c8d" />
                    <Text style={styles.installmentAmount}>
                      Amount: PKR {installment.amount?.toLocaleString() || '0'}
                    </Text>
                  </View>

                  {installment.status === 'paid' && installment.paidAt && (
                    <View style={styles.installmentRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#27ae60" />
                      <Text style={styles.paidDate}>
                        Paid on: {formatDate(installment.paidAt)}
                      </Text>
                    </View>
                  )}
                </View>

                {canPay && (
                  <View style={styles.payButton}>
                    <Text style={styles.payButtonText}>Tap to Pay</Text>
                    <Ionicons name="arrow-forward" size={16} color="#8e44ad" />
                  </View>
                )}

                {installment.status === 'paid' && (
                  <View style={styles.paidIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.paidText}>Payment Completed</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  installmentsList: {
    padding: 15,
    paddingTop: 0,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  installmentCard: {
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
  installmentCardDue: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  installmentCardPaid: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
    opacity: 0.8,
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  installmentNumber: {
    backgroundColor: '#f8f0fc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  installmentNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  installmentBody: {
    marginBottom: 10,
  },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  installmentDate: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
    fontWeight: '500',
  },
  installmentAmount: {
    fontSize: 16,
    color: '#8e44ad',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  paidDate: {
    fontSize: 13,
    color: '#27ae60',
    marginLeft: 8,
    fontWeight: '500',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f0fc',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  payButtonText: {
    color: '#8e44ad',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  paidIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  paidText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});

