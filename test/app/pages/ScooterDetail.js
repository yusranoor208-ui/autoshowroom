import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from "react-native";
import { Ionicons, AntDesign, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addToCart as addToCartAction, addToWishlist as addToWishlistAction } from "../redux/Slices/HomeDataSlice";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase"; // Make sure this path is correct

const { width } = Dimensions.get('window');

export default function ProductDetail({ navigation, route }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.home.wishlist);
  const auth = getAuth();
  
  // Product data
  const scooter = route?.params?.scooter || {
    id: 3,
    name: "METRO E8S PRO",
    price: "PKR 299,000",
    type: "E-Scooter",
    image: require("../../assets/images/EscooterB.png"),
    colors: ["blue", "black", "red"],
    selectedColor: "blue",
  };

  // State
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(scooter.selectedColor || scooter.colors?.[0] || "blue");
  const [paymentType, setPaymentType] = useState("full");
  const [installmentMonths, setInstallmentMonths] = useState(6);
  const [loading, setLoading] = useState(false);

  // Check if item is in wishlist
  const isInWishlist = wishlistItems.some(item => item.id === scooter.id);

  // Calculate installment
  const calculateInstallment = (months = installmentMonths) => {
    const priceString = scooter.price.replace(/[^0-9]/g, "");
    const totalPrice = parseInt(priceString) || 0;
    const interestRate = 0.1; // 10% annual
    const monthlyRate = interestRate / 12;
    const totalWithInterest = totalPrice * (1 + (monthlyRate * months));
    const monthlyPayment = Math.ceil(totalWithInterest / months);
    const totalPayment = monthlyPayment * months;
    const interestAmount = totalPayment - totalPrice;
    
    return {
      total: totalPrice,
      monthly: monthlyPayment,
      totalWithInterest: totalPayment,
      interest: interestAmount,
      formatted: `PKR ${monthlyPayment.toLocaleString()}/month`,
      totalFormatted: `PKR ${totalPayment.toLocaleString()}`,
      interestFormatted: `PKR ${interestAmount.toLocaleString()}`
    };
  };

  // Add to Cart function
  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to add items to cart.");
      navigation.navigate("Login");
      return;
    }

    setLoading(true);
    try {
      const cartItem = {
        id: `${scooter.id}-${Date.now()}`,
        productId: scooter.id,
        name: scooter.name,
        price: scooter.price,
        type: scooter.type,
        image: scooter.image,
        color: selectedColor,
        quantity: qty,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        ...(paymentType === "installment" ? {
          isInstallment: true,
          months: installmentMonths,
          monthlyAmount: calculateInstallment().monthly,
          totalAmount: calculateInstallment().totalWithInterest,
          interest: calculateInstallment().interest
        } : { isInstallment: false })
      };

      // Add to Firestore
      await addDoc(collection(db, "cart"), cartItem);
      
      // Update Redux
      dispatch(addToCartAction(cartItem));

      Alert.alert(
        "Added to Cart",
        `${scooter.name} has been added to your cart!`,
        [
          { text: "View Cart", onPress: () => navigation.navigate("Cart") },
          { text: "Continue Shopping" }
        ]
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Buy Now function
  const buyNow = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to continue with your purchase.");
      navigation.navigate("Login");
      return;
    }

    setLoading(true);
    try {
      const priceString = scooter.price.replace(/[^0-9]/g, "");
      const totalPrice = parseInt(priceString) || 0;
      const installmentData = paymentType === "installment" ? calculateInstallment() : null;

      // Prepare order data (not saved yet - will be saved on confirmation page)
      const orderData = {
        orderId: `ORD-${Date.now()}`,
        userId: user.uid,
        items: [{
          productId: scooter.id,
          name: scooter.name,
          price: scooter.price,
          quantity: qty,
          color: selectedColor,
          image: scooter.image,
          type: scooter.type
        }],
        status: "pending",
        payment: {
          method: paymentType === "installment" ? "installment" : "full",
          ...(paymentType === "installment" ? {
            months: installmentMonths,
            monthlyAmount: installmentData.monthly,
            totalAmount: installmentData.totalWithInterest,
            interest: installmentData.interest,
            paidAmount: 0,
            remainingAmount: installmentData.totalWithInterest,
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          } : {
            amount: totalPrice * qty
          })
        },
        shipping: {},
        createdAt: new Date().toISOString()
      };

      // Navigate to appropriate screen with order data
      if (paymentType === "installment") {
        // Pass installment plan data to InstallmentConfirmation
        navigation.navigate("InstallmentConfirmation", {
          orderData: orderData,
          installmentPlan: {
            months: installmentMonths,
            monthlyAmount: installmentData.monthly,
            totalAmount: installmentData.totalWithInterest,
            interest: installmentData.interest,
            total: installmentData.total,
            formatted: installmentData.formatted,
            totalFormatted: installmentData.totalFormatted,
            interestFormatted: installmentData.interestFormatted
          },
          product: {
            id: scooter.id,
            name: scooter.name,
            price: scooter.price,
            image: scooter.image,
            color: selectedColor,
            quantity: qty
          }
        });
      } else {
        // For full payment, navigate to Checkout
        navigation.navigate("Checkout", { orderData });
      }

    } catch (error) {
      console.error("Error preparing order:", error);
      Alert.alert("Error", "Failed to process your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    if (isInWishlist) {
      // Remove from wishlist logic if needed
    } else {
      dispatch(addToWishlistAction({
        id: scooter.id,
        name: scooter.name,
        price: scooter.price,
        type: scooter.type,
        image: scooter.image
      }));
    }
  };

  // Render function
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={toggleWishlist}>
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist ? "#ff4444" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Product Image */}
        <Image 
          source={scooter.image} 
          style={styles.productImage} 
          resizeMode="contain"
        />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{scooter.name}</Text>
          <Text style={styles.productPrice}>{scooter.price}</Text>
          <Text style={styles.productType}>{scooter.type}</Text>
          
          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.colorOptions}>
              {scooter.colors?.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    selectedColor === color && styles.selectedColorOption,
                    { backgroundColor: color }
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          {/* Payment Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Option</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentType === "full" && styles.selectedPaymentOption
                ]}
                onPress={() => setPaymentType("full")}
              >
                <View style={styles.radioButton}>
                  {paymentType === "full" && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.paymentOptionText}>Full Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentType === "installment" && styles.selectedPaymentOption
                ]}
                onPress={() => setPaymentType("installment")}
              >
                <View style={styles.radioButton}>
                  {paymentType === "installment" && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.paymentOptionText}>Installment Plan</Text>
              </TouchableOpacity>
            </View>

            {/* Installment Details */}
            {paymentType === "installment" && (
              <View style={styles.installmentDetails}>
                <View style={styles.durationOptions}>
                  {[3, 6, 9, 12].map((months) => (
                    <TouchableOpacity
                      key={months}
                      style={[
                        styles.durationOption,
                        installmentMonths === months && styles.selectedDurationOption
                      ]}
                      onPress={() => setInstallmentMonths(months)}
                    >
                      <Text 
                        style={[
                          styles.durationText,
                          installmentMonths === months && styles.selectedDurationText
                        ]}
                      >
                        {months} Months
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.installmentSummary}>
                  <View style={styles.summaryRow}>
                    <Text>Monthly Installment:</Text>
                    <Text style={styles.summaryValue}>
                      {calculateInstallment().formatted}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>Total Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {calculateInstallment().totalFormatted}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>Interest Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {calculateInstallment().interestFormatted}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
              >
                <Ionicons name="remove" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{qty}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQty(qty + 1)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {paymentType === "installment" 
              ? calculateInstallment().formatted 
              : `PKR ${(parseFloat(scooter.price.replace(/[^0-9]/g, "")) * qty).toLocaleString()}`
            }
          </Text>
          {paymentType === "installment" && (
            <Text style={styles.installmentNote}>
              {installmentMonths} months • {calculateInstallment().totalFormatted} total
            </Text>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cartButton]}
            onPress={addToCart}
            disabled={loading}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.buyButton]}
            onPress={buyNow}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#8e44ad',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f9fa',
  },
  infoContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginBottom: 5,
  },
  productType: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#eee',
  },
  selectedColorOption: {
    borderColor: '#8e44ad',
    borderWidth: 3,
  },
  paymentOptions: {
    marginTop: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPaymentOption: {
    borderColor: '#8e44ad',
    backgroundColor: '#f8f0fc',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8e44ad',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8e44ad',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  installmentDetails: {
    marginTop: 15,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  durationOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedDurationOption: {
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
  },
  durationText: {
    color: '#2c3e50',
  },
  selectedDurationText: {
    color: '#fff',
    fontWeight: '600',
  },
  installmentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  installmentNote: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cartButton: {
    backgroundColor: '#8e44ad',
  },
  buyButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
});