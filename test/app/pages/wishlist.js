
import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../redux/Slices/HomeDataSlice";

export default function Wishlist({ navigation }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.home.wishlist);

  const handleRemoveFromWishlist = (id) => {
    dispatch(removeFromWishlist(id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Wishlist ❤️</Text>

      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in wishlist</Text>
          <TouchableOpacity 
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate("ScooterDetail", { scooter: item })}
            >
              <Image source={item.image} style={styles.image} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.type}>{item.type}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveFromWishlist(item.id);
                }}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#2c3e50" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: { 
    fontSize: 18, 
    color: "#95a5a6",
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: "#8e44ad",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: { width: 80, height: 80, resizeMode: "contain" },
  name: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  type: { fontSize: 12, color: "#95a5a6", marginTop: 2 },
  price: { fontSize: 16, color: "#8e44ad", fontWeight: "600", marginTop: 5 },
  removeBtn: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
