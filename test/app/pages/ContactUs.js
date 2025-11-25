import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking
} from "react-native";
import Chat from "../components/Chat";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";

const ContactPage = () => {
  const handlePhonePress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#222" }}>
      <View style={styles.chatContainer}>
        <Chat />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Get More Information</Text>
          <Text style={styles.text}>
            Do you want to receive more information about a particular item/vehicle?
            {"\n"}Just fill this form, A member of our team will get back you soon.
          </Text>

          <Text style={styles.sectionTitle}>Contact Us</Text>

          <View style={styles.contactItem}>
            <Text style={styles.locationTitle}>Karachi:</Text>
            <Text style={styles.text}>
              Ground Floor, Caesar’s Tower, Opposite Aisha Bawani Academy,
              Shahrah-e-Faisal, Karachi, Pakistan.
            </Text>
            <Text style={styles.link} onPress={() => handlePhonePress('02132796988')}>021 3279 6988</Text>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.locationTitle}>Lahore:</Text>
            <Text style={styles.text}>
              391, J-3 Johar Town, Near McDonald’s, Nazria-e-Pakistan Avenue, Lahore.
            </Text>
            <Text style={styles.link} onPress={() => handlePhonePress('04235317598')}>0423 5317598</Text>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.locationTitle}>Call Us:</Text>
            <Text style={styles.link} onPress={() => handlePhonePress('+923457008988')}>+92 345 700 8988</Text>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.locationTitle}>Email Address:</Text>
            <Text style={styles.link} onPress={() => handleEmailPress('contact@metrobay.pk')}>contact@metrobay.pk</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#444',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 5,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ContactPage;
