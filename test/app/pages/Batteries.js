import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { incrementCart } from "../redux/Slices/HomeDataSlice";
import { getAllData } from "../Helper/firebaseHelper";

export default function Batteries({ navigation }) {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default image for battery
  const defaultImage = require("../../assets/images/Battery.png");

  useEffect(() => {
    fetchBatteries();
  }, []);

  const fetchBatteries = async () => {
    try {
      const products = await getAllData("products");
      // Filter only Battery type products
      const batteries = products
        .filter(product => product.type === "Battery")
        .map(product => ({
          ...product,
          // Use first uploaded image if available, otherwise use default
          image: product.images && product.images.length > 0 
            ? { uri: product.images[0] } 
            : defaultImage,
        }));
      setItems(batteries);
    } catch (error) {
      console.error("Error fetching batteries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={{ marginTop: 10, color: "#8e44ad" }}>Loading Batteries...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: 50 }}>
          <Text style={{ fontSize: 16, color: "#95a5a6", textAlign: "center" }}>
            No Batteries available at the moment
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => navigation.navigate("ScooterDetail", { scooter: item })}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subTitle}>{item.type}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subTitle: {
    fontSize: 14,
    color: "#95a5a6",
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8e44ad",
    marginBottom: 10,
  },
});


