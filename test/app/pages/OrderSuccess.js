import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function OrderSuccess({ navigation, route }) {
  const { orderId, total, items } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={80} color="#fff" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Order Placed Successfully! 🎉</Text>
        <Text style={styles.subtitle}>
          Thank you for your order. We'll send you a confirmation email shortly.
        </Text>

        {/* Order Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="receipt" size={24} color="#8e44ad" />
            <Text style={styles.cardTitle}>Order Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{orderId?.slice(0, 12) || 'N/A'}...</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.valueHighlight}>
              PKR {typeof total === 'number' ? total.toLocaleString() : total || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Items:</Text>
            <Text style={styles.value}>{items?.length || 0} item(s)</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>
        </View>

        {/* What's Next Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="information" size={24} color="#3498db" />
            <Text style={styles.cardTitle}>What's Next?</Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Order Confirmation</Text>
                <Text style={styles.stepDescription}>
                  You'll receive a confirmation email with order details
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Processing</Text>
                <Text style={styles.stepDescription}>
                  We'll start processing your order within 24 hours
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Delivery</Text>
                <Text style={styles.stepDescription}>
                  Your order will be delivered to your address
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <MaterialCommunityIcons name="headset" size={24} color="#27ae60" />
          <Text style={styles.supportText}>
            Need help? Contact our support team
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => navigation.navigate('ContactUs')}
          >
            <Text style={styles.supportButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons name="account" size={20} color="#8e44ad" />
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#27ae60",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    color: "#7f8c8d",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
  },
  valueHighlight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8e44ad",
  },
  statusBadge: {
    backgroundColor: "#fff3cd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#856404",
    fontWeight: "600",
    fontSize: 12,
  },
  stepContainer: {
    marginTop: 10,
  },
  step: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8e44ad",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: "#d4edda",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  supportText: {
    fontSize: 15,
    color: "#155724",
    marginVertical: 10,
    textAlign: "center",
  },
  supportButton: {
    backgroundColor: "#27ae60",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 5,
  },
  supportButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: "#8e44ad",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#8e44ad",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#8e44ad",
  },
  secondaryButtonText: {
    color: "#8e44ad",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
