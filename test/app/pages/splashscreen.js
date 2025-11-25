// app/pages/SplashScreen.js
import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { setRole, setUser } from "../redux/Slices/HomeDataSlice";

export default function splashscreen({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Wait for 2 seconds to show splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user is logged in
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is logged in, fetch user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = { uid: user.uid, ...userDoc.data() };
              dispatch(setUser(userData));
              dispatch(setRole(userData.role || "Customer"));
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
        // Always navigate to Home (Main) regardless of login status
        navigation.replace("Main");
      });
    };

    checkAuthStatus();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/pic4.png")} 
        style={styles.logo}
      />

      {/* App Name */}
      <Text style={styles.title}>AUTO SHOWROOM</Text>
      
      {/* Loading Indicator */}
      <ActivityIndicator 
        size="large" 
        color="#fff" 
        style={{ marginTop: 20 }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7b2cbf",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff", 
    letterSpacing: 2,
  },
});
