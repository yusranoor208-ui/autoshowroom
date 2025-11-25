import React from "react";
import { View, StyleSheet } from "react-native";
import Chat from "../components/Chat";

const ChatPage = () => {
  return (
    <View style={styles.container}>
      <Chat />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default ChatPage;


