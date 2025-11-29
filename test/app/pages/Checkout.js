import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addData } from "../Helper/firebaseHelper";
import { useDispatch, useSelector } from "react-redux";
import { clearCartItems } from "../redux/Slices/HomeDataSlice";
import { useRoute } from "@react-navigation/native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

// Custom Checkbox Component
const CustomCheckbox = ({ value, onValueChange, label }) => {
  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </View>
      {label && <Text style={styles.checkboxLabel}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default function CheckoutScreen({ navigation }) {
  const route = useRoute();
  const auth = getAuth();
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const cartItems = useSelector((state) => state.home.cartItems);
  
  // Check if orderData is passed from Buy Now flow
  const orderDataFromRoute = route.params?.orderData;
  const isBuyNowFlow = !!orderDataFromRoute;
  
  // Use orderData from route if available, otherwise use cart items
  const orderItems = isBuyNowFlow ? orderDataFromRoute.items : cartItems;
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    townCity: '',
    stateCounty: '',
    phone: '',
    email: '',
    paymentMethod: 'Cash on Delivery'
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle payment method selection
  const handlePaymentMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  // Validate form
  const validateForm = () => {
    const required = ['firstName', 'lastName', 'streetAddress', 'townCity', 'phone', 'email'];
    for (let field of required) {
      if (!formData[field].trim()) {
        Alert.alert('Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ''));
    return sum + (price * item.quantity);
  }, 0);
  const delivery = orderItems.length > 0 ? 2000 : 0;
  const total = subtotal + delivery;

  // Submit order to Firebase
  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Please sign in to place an order.');
      navigation.navigate('Login');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'No items to order!');
      return;
    }

    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let finalOrderData;

      if (isBuyNowFlow) {
        // Buy Now flow - merge form data with existing orderData
        finalOrderData = {
          ...orderDataFromRoute,
          ...formData,
          items: orderItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            type: item.type,
            image: item.image
          })),
          subtotal: subtotal,
          deliveryFee: delivery,
          total: total,
          shipToDifferentAddress: checked,
          paymentMethod: formData.paymentMethod,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'pending'
        };
      } else {
        // Cart flow - create new order from cart items
        finalOrderData = {
          orderId: `ORD-${Date.now()}`,
          userId: user.uid,
          ...formData,
          items: cartItems.map(item => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            type: item.type,
            image: item.image,
            isInstallment: item.isInstallment || false,
            months: item.months || 0,
            monthlyAmount: item.monthlyAmount || 0
          })),
          payment: {
            method: 'full',
            amount: total
          },
          subtotal: subtotal,
          deliveryFee: delivery,
          total: total,
          shipToDifferentAddress: checked,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'pending'
        };
      }
      
      // Save order to Firestore
      const docRef = await addDoc(collection(db, 'orders'), finalOrderData);
      const orderId = docRef.id;
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        streetAddress: '',
        townCity: '',
        stateCounty: '',
        phone: '',
        email: '',
        paymentMethod: 'Cash on Delivery'
      });
      setChecked(false);
      
      // Clear cart only if not Buy Now flow
      if (!isBuyNowFlow) {
        dispatch(clearCartItems());
      }
      
      // Navigate to Order Success page
      navigation.navigate('OrderSuccess', {
        orderId: orderId,
        total: total,
        items: orderItems
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Billing Details */}
      <View style={styles.card}>
        <Text style={styles.title}>Billing detail</Text>

        <TextInput 
          placeholder="First name" 
          style={styles.input} 
          value={formData.firstName}
          onChangeText={(text) => handleInputChange('firstName', text)}
        />
        <TextInput 
          placeholder="Last name" 
          style={styles.input} 
          value={formData.lastName}
          onChangeText={(text) => handleInputChange('lastName', text)}
        />
        <TextInput placeholder="Country/Region (Pakistan)" style={styles.input} editable={false} />
        <TextInput 
          placeholder="Street address" 
          style={styles.input} 
          value={formData.streetAddress}
          onChangeText={(text) => handleInputChange('streetAddress', text)}
        />
        <TextInput 
          placeholder="Town/City" 
          style={styles.input} 
          value={formData.townCity}
          onChangeText={(text) => handleInputChange('townCity', text)}
        />
        <TextInput 
          placeholder="State/County" 
          style={styles.input} 
          value={formData.stateCounty}
          onChangeText={(text) => handleInputChange('stateCounty', text)}
        />
        <TextInput 
          placeholder="Phone" 
          style={styles.input} 
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          keyboardType="phone-pad"
        />
        <TextInput 
          placeholder="Email address" 
          style={styles.input} 
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomCheckbox
          value={checked}
          onValueChange={setChecked}
          label="Ship to a different address?"
        />
      </View>

      {/* Order Summary */}
      <View style={styles.card}>
        <Text style={styles.title}>Your Order</Text>
        
        {orderItems.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text>{item.name} x {item.quantity}</Text>
            <Text>PKR {(parseInt(item.price.replace(/[^0-9]/g, '')) * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
        
        <View style={[styles.row, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }]}>
          <Text>Subtotal</Text>
          <Text>PKR {subtotal.toLocaleString()}</Text>
        </View>
        
        <View style={styles.row}>
          <Text>Delivery Fee</Text>
          <Text>PKR {delivery.toLocaleString()}</Text>
        </View>
        
        <View style={[styles.row, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }]}>
          <Text style={styles.bold}>Total</Text>
          <Text style={[styles.bold, { color: '#8e44ad' }]}>PKR {total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.card}>
        <Text style={styles.title}>Payment Information</Text>

        <TouchableOpacity 
          style={[styles.radio, formData.paymentMethod === 'Cash on Delivery' && styles.selectedRadio]}
          onPress={() => handlePaymentMethod('Cash on Delivery')}
        >
          <Text style={formData.paymentMethod === 'Cash on Delivery' && styles.selectedText}>Cash on Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radio, formData.paymentMethod === 'Credit/Debit Card' && styles.selectedRadio]}
          onPress={() => handlePaymentMethod('Credit/Debit Card')}
        >
          <Text style={formData.paymentMethod === 'Credit/Debit Card' && styles.selectedText}>Credit/Debit Card</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radio, formData.paymentMethod === 'JazzCash Payment' && styles.selectedRadio]}
          onPress={() => handlePaymentMethod('JazzCash Payment')}
        >
          <Text style={formData.paymentMethod === 'JazzCash Payment' && styles.selectedText}>JazzCash Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Place Order */}
      <TouchableOpacity 
        style={[styles.btn, loading && styles.btnDisabled]} 
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    backgroundColor: "#8e44ad", 
    padding: 15,
    paddingTop: 40,
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1, textAlign: "center" },
  card: { backgroundColor: "#fff", margin: 10, padding: 15, borderRadius: 10, elevation: 3 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#8e44ad",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#8e44ad",
    borderColor: "#8e44ad",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  bold: { fontWeight: "bold" },
  radio: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5 },
  selectedRadio: { backgroundColor: "#8e44ad" },
  selectedText: { color: "#fff", fontWeight: "bold" },
  btn: { backgroundColor: "#8e44ad", margin: 15, padding: 15, borderRadius: 25, alignItems: "center", elevation: 3 },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
