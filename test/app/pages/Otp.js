import React from "react";

import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  flex,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const Otp= ({ navigation }) => {
  const goToOtp= () => {
    navigation.navigate("VerificationOtp");
  };
  return (
    <ScrollView style={{ height: "100%" }}>
      <View style={{ backgroundColor: "#FAEBD7", display: flex, flex: 1 }}>
        <View>
          <Text
            style={{
              fontSize: 20,
              color: "grey",
              textAlign: "center",
              paddingTop: 10,

              fontWeight:"bold"
            }}
          >
                 Hello!  Registrater to get started 
          </Text>
        </View>

        <View>
          <TextInput
            style={{
              borderColor: "white",
              borderWidth: 1,
              width: "80%",
              height: 50,
              alignSelf: "center",
              borderRadius: 10,
              marginTop: 40,
              backgroundColor: "white",
              paddingLeft: 10,
            }}
            placeholder="username"
          />
          <TextInput
            style={{
              borderColor: "white",
              borderWidth: 1,
              width: "80%",
              height: 50,
              alignSelf: "center",
              borderRadius: 10,
              marginTop: 40,
              backgroundColor: "white",
              paddingLeft: 10,
            }}
            placeholder="Phone NO."
          />
        </View>
        {/* <Text
          style={{
            fontSize: 12,
            color: "black",
            textAlign: "center",
            paddingTop: 20,
          }}
        >
          I accept the terms and privacy policy
        </Text> */}
        {/* <View>


          <AntDesign name="checkcircle" size={24} color="#8B1E23" /> */}

          <View>
          <TouchableOpacity
        onPress={() => navigation.navigate("Otp")}
            style={{
              width: "50%",
              height: 50,
              backgroundColor: "#68181cff",
              alignSelf: "center",
              borderRadius: 10,
              marginTop: 40,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: "white",
                textAlign: "center",
                paddingTop: 10,
              }}
            >
              Send Otp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Otp;