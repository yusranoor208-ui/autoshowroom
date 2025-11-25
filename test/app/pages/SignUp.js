import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import { handleSignUp } from "../Helper/firebaseHelper";
import { setRole, setUser } from "../redux/Slices/HomeDataSlice";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const goToLogin = async () => {
    try {
      const user = await handleSignUp(email, password, {
        role: "Customer",
        phone,
        name,
        email,
        password,
      });

      if (user?.uid) {
        dispatch(setRole("Customer"));
        dispatch(setUser(user));
        navigation.replace("Main");
      } else {
        alert("Error in sign up");
      }
    } catch (error) {
      alert("Sign up failed: " + error.message);
    }
}

return (
  <ScrollView
    contentContainerStyle={{
      flexGrow: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      paddingBottom: 100,
    }}
  >
    <View
      style={{
        width: "80%",
        backgroundColor: "#7b2ff7",
        paddingVertical: 30,
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
        Join now
      </Text>
    </View>

    <View
      style={{
        width: "80%",
        margin: 20,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        elevation: 3,
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
        Register
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
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#7b2ff7",
          borderRadius: 20,
          paddingHorizontal: 15,
          paddingVertical: 8,
          marginBottom: 15,
        }}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#7b2ff7",
          borderRadius: 20,
          paddingHorizontal: 15,
          paddingVertical: 8,
          marginBottom: 15,
        }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#7b2ff7",
          borderRadius: 20,
          paddingHorizontal: 15,
          paddingVertical: 8,
          marginBottom: 15,
        }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#7b2ff7",
          paddingVertical: 12,
          borderRadius: 20,
          alignItems: "center",
          marginTop: 10,
        }}
        onPress={() => goToLogin()}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Sign up
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text
          style={{
            textAlign: "center",
            color: "#7b2ff7",
            marginTop: 15,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          Already have an account? <Text style={{ textDecorationLine: "underline" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
)}
