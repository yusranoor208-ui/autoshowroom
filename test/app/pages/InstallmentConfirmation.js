import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function InstallmentConfirmation() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, installmentDetails } = route.params || {};

  if (!installmentDetails) {
    return (
      <View style={styles.container}>
        <Text>No installment details found</Text>
      </View>
    );
  }

  const { months, monthlyAmount, totalAmount, interest } = installmentDetails;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Installment Confirmation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#27ae60" />
          </View>
          <Text style={styles.successTitle}>Installment Plan Created!</Text>
          <Text style={styles.orderNumber}>Order #: {orderId}</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Installment:</Text>
              <Text style={styles.detailValue}>PKR {monthlyAmount.toLocaleString()}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{months} months</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Amount:</Text>
              <Text style={styles.detailValue}>PKR {interest.toLocaleString()}</Text>
            </View>
            
            <View style={[styles.detailRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }]}>
              <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>Total Amount:</Text>
              <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#8e44ad' }]}>
                PKR {totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.noteBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#f39c12" />
            <Text style={styles.noteText}>
              Your first installment will be due on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
              You'll receive payment reminders via email.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.secondaryButtonText}>View My Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  content: {
    flex: 1,
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  orderNumber: {
    color: '#7f8c8d',
    marginBottom: 30,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  detailValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#fef9e7',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  noteText: {
    color: '#9c7c0c',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#8e44ad',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#8e44ad',
    fontSize: 16,
    fontWeight: '600',
  },
});
