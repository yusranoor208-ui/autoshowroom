import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, CheckBox, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addData } from "../Helper/firebaseHelper";
import { useDispatch, useSelector } from "react-redux";
import { clearCartItems } from "../redux/Slices/HomeDataSlice";

export default function CheckoutScreen({ navigation }) {
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const cartItems = useSelector((state) => state.home.cartItems);
  
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
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ''));
    return sum + (price * item.quantity);
  }, 0);
  const delivery = cartItems.length > 0 ? 2000 : 0;
  const total = subtotal + delivery;

  // Submit order to Firebase
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty!');
      return;
    }

    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          type: item.type,
          isInstallment: item.isInstallment || false,
          months: item.months || 0,
          monthlyAmount: item.monthlyAmount || 0
        })),
        subtotal: subtotal,
        deliveryFee: delivery,
        total: total,
        shipToDifferentAddress: checked,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const orderId = await addData('orders', orderData);
      
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
      dispatch(clearCartItems());
      
      // Navigate to Order Success page
      navigation.navigate('OrderSuccess', {
        orderId: orderId,
        total: total,
        items: cartItems
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

        <View style={styles.checkboxRow}>
          <CheckBox value={checked} onValueChange={setChecked} />
          <Text>Ship to a different address?</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.card}>
        <Text style={styles.title}>Your Order</Text>
        
        {cartItems.map((item, index) => (
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
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  bold: { fontWeight: "bold" },
  radio: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5 },
  selectedRadio: { backgroundColor: "#8e44ad" },
  selectedText: { color: "#fff", fontWeight: "bold" },
  btn: { backgroundColor: "#8e44ad", margin: 15, padding: 15, borderRadius: 25, alignItems: "center", elevation: 3 },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
