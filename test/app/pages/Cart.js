// app/pages/Cart.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItemQuantity, removeFromCart, clearCartItems } from "../redux/Slices/HomeDataSlice";

export default function Cart({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.home.cartItems);

  const handleClearCart = () => {
    dispatch(clearCartItems());
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty > 0) {
      dispatch(updateCartItemQuantity({ id, quantity: newQty }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ''));
    return sum + (price * item.quantity);
  }, 0);
  const delivery = cartItems.length > 0 ? 2000 : 0;
  const total = subtotal + delivery;

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10, color: "#95a5a6" }}>Your cart is empty</Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={{ color: "#e74c3c", fontWeight: "600" }}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={item.image} style={styles.image} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemType}>{item.type}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              {item.color && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.colorText}>{item.color}</Text>
                </View>
              )}
            </View>

            <View style={{ alignItems: "center" }}>
              <View style={styles.qtyBox}>
                <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                  <AntDesign name="minus" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff", marginHorizontal: 10, fontWeight: "bold" }}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                  <AntDesign name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 200 }}
      />

      {/* Bottom Summary */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>PKR {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee:</Text>
            <Text style={styles.priceValue}>PKR {delivery.toLocaleString()}</Text>
          </View>
          <View style={[styles.priceRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e0e0e0" }]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>PKR {total.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Checkout")} style={styles.checkoutBtn}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2c3e50" },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: { width: 80, height: 80, resizeMode: "contain" },
  itemName: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  itemType: { fontSize: 12, color: "#95a5a6", marginTop: 2 },
  itemPrice: { fontSize: 16, color: "#8e44ad", fontWeight: "600", marginTop: 5 },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  colorText: { fontSize: 12, color: "#7f8c8d", textTransform: "capitalize" },
  qtyBox: {
    flexDirection: "row",
    backgroundColor: "#8e44ad",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: "center",
  },
  removeBtn: {
    marginTop: 10,
    padding: 5,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceBox: { marginBottom: 15 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  priceLabel: { fontSize: 14, color: "#7f8c8d" },
  priceValue: { fontSize: 14, color: "#2c3e50", fontWeight: "600" },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#8e44ad" },
  checkoutBtn: {
    backgroundColor: "#8e44ad",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#8e44ad",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkoutBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
