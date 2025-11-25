
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { handleLogin} from "../Helper/firebaseHelper";
import { setRole, setUser } from "../redux/Slices/HomeDataSlice";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const dispatch = useDispatch();
  const goToHome= async () => {
    // Clear previous errors
    setError("");
    
    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    try {
      const user = await handleLogin(email.trim(), password);

      if (user?.uid) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          let userData = { uid: user.uid, email: user.email };
          
          if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
          }
          
          dispatch(setRole(userData.role || "Customer"));
          dispatch(setUser(userData));
          navigation.replace("Main");
        } catch (dbError) {
          console.error("Error fetching user data:", dbError);
          // Still proceed with login even if Firestore fetch fails
          dispatch(setRole("Customer"));
          dispatch(setUser({ uid: user.uid, email: user.email }));
          navigation.replace("Main");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Better error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
}


  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", paddingBottom: 100,
        flexGrow: 1,
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          backgroundColor: "#7b2ff7",
          paddingVertical: 40,
          alignItems: "center",
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          width:"80%"
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Hey!
        </Text>
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Welcome Back
        </Text>
      </View>

      <View
        style={{
          margin: 20,
          padding: 20,
          backgroundColor: "#fff",
          borderRadius: 20,
          elevation: 3,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          width:"80%",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#7b2ff7",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Login
        </Text>

        {error ? (
          <View
            style={{
              backgroundColor: "#fee",
              padding: 10,
              borderRadius: 8,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: "#fcc",
            }}
          >
            <Text style={{ color: "#c33", fontSize: 12, textAlign: "center" }}>
              {error}
            </Text>
          </View>
        ) : null}

        <Text
          style={{
            color: "#7b2ff7",
            marginBottom: 5,
          }}
        >
          Email
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#7b2ff7",
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginBottom: 15,
          }}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <Text
          style={{
            color: "#7b2ff7",
            marginBottom: 5,
          }}
        >
          Password
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#7b2ff7",
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginBottom: 15,
          }}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
        <TouchableOpacity
          style={{
            backgroundColor: loading ? "#999" : "#7b2ff7",
            paddingVertical: 12,
            borderRadius: 20,
            alignItems: "center",
            marginTop: 10,
            opacity: loading ? 0.6 : 1,
          }}
          onPress={() => goToHome()}
          disabled={loading}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text
            style={{
              textAlign: "center",
              color: "#7b2ff7",
              marginTop: 15,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            Don't have an account? <Text style={{ textDecorationLine: "underline" }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}