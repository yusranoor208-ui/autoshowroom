import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { addData, getAllData } from "../Helper/firebaseHelper";

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsData = await getAllData('reviews');
      // Sort by date, newest first
      const sortedReviews = reviewsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReviews(sortedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ User input states
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ⭐ Function to render clickable stars
  const renderStars = () => {
    return (
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={{ fontSize: 28, marginHorizontal: 2 }}>
              {star <= rating ? "⭐" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ⭐ Submit new review
  const handleSubmit = async () => {
    if (!rating || !reviewText || !name) {
      Alert.alert("Error", "Please give rating, write review & your name.");
      return;
    }

    setSubmitting(true);

    try {
      const newReview = {
        title: title || "No Title",
        rating: rating,
        review: reviewText,
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        status: 'pending' // Admin can approve/reject
      };

      await addData('reviews', newReview);

      Alert.alert(
        "Success! ⭐",
        "Your review has been submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setRating(0);
              setTitle("");
              setReviewText("");
              setName("");
              setEmail("");
              // Refresh reviews
              fetchReviews();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={{ marginTop: 10, color: "#8e44ad" }}>Loading Reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Reviews ({reviews.length})</Text>

      {/* Review Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Your overall rating</Text>
        {renderStars()}

        <TextInput
          placeholder="Title of your review"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Your review"
          style={[styles.input, { height: 80 }]}
          multiline
          value={reviewText}
          onChangeText={setReviewText}
        />
        <TextInput
          placeholder="Your name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity 
          style={[styles.button, submitting && { backgroundColor: '#ccc' }]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#95a5a6' }}>No reviews yet. Be the first to review!</Text>
        </View>
      ) : (
        reviews.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>

            {/* Show stars */}
            <View style={{ flexDirection: "row", marginVertical: 5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={{ fontSize: 18 }}>
                  {star <= item.rating ? "⭐" : "☆"}
                </Text>
              ))}
            </View>

            <Text style={styles.cardReview}>{item.review}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#7b2cbf",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  form: { marginBottom: 20 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#7b2cbf",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  cardDate: { fontSize: 12, color: "#555" },
  cardReview: { marginTop: 5, fontSize: 14, color: "#333" },
  cardName: { marginTop: 5, fontWeight: "bold", color: "#7b2cbf" },
  loadMore: {
    backgroundColor: "#7b2cbf",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  loadText: { color: "#fff", fontWeight: "bold" },
});
