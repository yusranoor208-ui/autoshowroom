import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const ratingOptions = [1, 2, 3, 4, 5];

export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || user.email?.split("@")[0] || "");
      setEmail(user.email || "");
    }
  }, []);

  useEffect(() => {
    const feedbackQuery = query(
      collection(db, "feedback"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbackList(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading feedback:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setRating(5);
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Feedback Required", "Please write your feedback message.");
      return;
    }

    if (!rating) {
      Alert.alert("Rating Required", "Please select a rating.");
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      await addDoc(collection(db, "feedback"), {
        rating,
        message: message.trim(),
        customerName: name.trim() || currentUser?.displayName || "Anonymous",
        customerEmail: email.trim() || currentUser?.email || "",
        customerId: currentUser?.uid || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        "Thank you!",
        "Your feedback has been received. Our team will review it shortly."
      );
      resetForm();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        "Submission Failed",
        "Unable to submit feedback right now. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = useMemo(
    () =>
      ratingOptions.map((value) => (
        <TouchableOpacity
          key={value}
          onPress={() => setRating(value)}
          style={styles.starButton}
        >
          <Text style={styles.starText}>{value <= rating ? "⭐" : "☆"}</Text>
        </TouchableOpacity>
      )),
    [rating]
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Share Your Feedback</Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Overall Rating</Text>
        <View style={styles.starsRow}>{renderStars}</View>

        <Text style={styles.sectionLabel}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.sectionLabel}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.sectionLabel}>Your Feedback</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Write your experience or suggestions..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.heading, { marginTop: 20 }]}>Recent Feedback</Text>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#7b2ff7" />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
      ) : feedbackList.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No feedback yet. Be the first!</Text>
        </View>
      ) : (
        feedbackList.map((item) => (
          <View key={item.id} style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View>
                <Text style={styles.feedbackName}>
                  {item.customerName || "Anonymous"}
                </Text>
                <Text style={styles.feedbackMeta}>
                  {formatTimestamp(item.createdAt)} ·{" "}
                  {item.status ? item.status.toUpperCase() : "PENDING"}
                </Text>
              </View>
              <Text style={styles.feedbackRating}>
                {"⭐".repeat(item.rating || 0)}
              </Text>
            </View>
            <Text style={styles.feedbackMessage}>{item.message}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7fb",
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d2f48",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionLabel: {
    fontWeight: "600",
    color: "#4a4c72",
    marginBottom: 6,
    marginTop: 12,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  starButton: {
    marginHorizontal: 4,
  },
  starText: {
    fontSize: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7d9e7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafbff",
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7b2ff7",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingState: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#7b2ff7",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    marginTop: 8,
    color: "#7b7d97",
    fontSize: 16,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#eef0fb",
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  feedbackName: {
    fontWeight: "700",
    color: "#2d2f48",
  },
  feedbackMeta: {
    color: "#8a8cab",
    fontSize: 12,
    marginTop: 2,
  },
  feedbackRating: {
    fontSize: 16,
  },
  feedbackMessage: {
    color: "#4a4c72",
    lineHeight: 20,
  },
});

