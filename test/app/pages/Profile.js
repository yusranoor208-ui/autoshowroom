import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearCart } from "../redux/Slices/HomeDataSlice";
import { logout } from "../Helper/firebaseHelper";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Profile({ navigation }) {
  const user = useSelector((state) => state.home.user);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user?.uid]);

  const fetchUserData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name || userData.displayName || "");
        setPhone(userData.phone || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(setUser({}));
      dispatch(clearCart());
      navigation.reset({ index: 0, routes: [{ name: "SignUp" }] });
    } catch (e) {
      console.log("Logout error", e);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      setSaving(true);
      await setDoc(doc(db, "users", user.uid), { name, phone }, { merge: true });
      Alert.alert("Saved", "Profile updated successfully");
    } catch (e) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={{ marginTop: 10, color: "#6a0dad" }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!user?.uid) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 16, color: "#777", marginBottom: 20 }}>Please login to view profile</Text>
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: "#6a0dad" }]} 
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>UID</Text>
        <Text style={styles.value}>{user?.uid || "—"}</Text>
        
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "—"}</Text>
        
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role || "Customer"}</Text>
        
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" />
        
        <Text style={styles.label}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="Your phone" keyboardType="phone-pad" />
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: "#6a0dad", marginBottom: 10 }]} onPress={handleSave} disabled={saving}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>{saving ? "Saving..." : "Save Profile"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: { color: "#777", marginTop: 8 },
  value: { fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});


