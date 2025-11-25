// Admin page to seed products to Firebase
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { seedProducts } from "../Helper/seedProductsHelper";

export default function SeedProducts({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeedProducts = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await seedProducts();
      setResult(response);
      
      if (response.success) {
        Alert.alert(
          "Success! ✅",
          response.message,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Info ℹ️",
          response.message,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error ❌",
        `Failed to seed products: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌱 Seed Products to Firebase</Text>
        
        <Text style={styles.description}>
          This will add all products (E-Scooters, Rikshaws, and Batteries) to your Firebase database.
        </Text>

        <Text style={styles.warning}>
          ⚠️ Note: This should only be run once. If products already exist, it will skip adding them.
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSeedProducts}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Adding Products..." : "Seed Products to Firebase"}
          </Text>
        </TouchableOpacity>

        {result && (
          <View style={[
            styles.resultBox,
            result.success ? styles.successBox : styles.infoBox
          ]}>
            <Text style={styles.resultTitle}>
              {result.success ? "✅ Success" : "ℹ️ Info"}
            </Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            {result.count > 0 && (
              <Text style={styles.resultCount}>Products: {result.count}</Text>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Products to be added:</Text>
          <Text style={styles.infoItem}>• 3 E-Scooters (METRO T9 ECO, METRO THRILL, METRO E8S PRO)</Text>
          <Text style={styles.infoItem}>• 1 Rikshaw (Electric Rikshaw X1)</Text>
          <Text style={styles.infoItem}>• 2 Batteries (60V and 72V Lithium)</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
  },
  warning: {
    fontSize: 14,
    color: "#e67e22",
    textAlign: "center",
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  button: {
    backgroundColor: "#8e44ad",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultBox: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: "#d4edda",
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  infoBox: {
    backgroundColor: "#d1ecf1",
    borderWidth: 1,
    borderColor: "#bee5eb",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultMessage: {
    fontSize: 16,
    marginBottom: 5,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#34495e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
