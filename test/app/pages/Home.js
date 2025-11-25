// pages/Home.js
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllData } from "../Helper/firebaseHelper";

export default function Home({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get icon based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    
    if (name.includes('rikshaw') || name.includes('rickshaw') || name.includes('rikhaw')) {
      return 'car'; // Car icon for rickshaw
    } else if (name.includes('scooter') || name.includes('scooty') || name.includes('escooter')) {
      return 'bicycle'; // Bicycle icon for scooter
    } else if (name.includes('battery') || name.includes('batteries')) {
      return 'battery-charging'; // Battery icon
    } else if (name.includes('car') || name.includes('vehicle')) {
      return 'car-sport';
    } else {
      return 'cube'; // Default icon
    }
  };

  // Get icon color based on category
  const getCategoryIconColor = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    
    if (name.includes('rikshaw') || name.includes('rickshaw') || name.includes('rikhaw')) {
      return '#e74c3c'; // Red for rickshaw
    } else if (name.includes('scooter') || name.includes('scooty') || name.includes('escooter')) {
      return '#3498db'; // Blue for scooter
    } else if (name.includes('battery') || name.includes('batteries')) {
      return '#f39c12'; // Orange for battery
    } else {
      return '#7b2ff7'; // Purple default
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const categoriesData = await getAllData("categories");
      console.log('Raw categories data:', categoriesData);
      
      if (!categoriesData || categoriesData.length === 0) {
        console.log('No categories found in the database');
        setCategories([]);
        return;
      }
      
      // Map categories with icons or images
      const mappedCategories = categoriesData.map(cat => {
        const categoryName = cat.name || 'Unnamed Category';
        return {
          id: cat.id,
          name: categoryName,
          route: cat.route || 'Products',
          icon: getCategoryIcon(categoryName),
          iconColor: getCategoryIconColor(categoryName),
          imageUrl: cat.imageUrl || null, // Add image URL from database
        };
      });
      
      console.log('Mapped categories:', mappedCategories);
      setCategories(mappedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set some default categories if there's an error
      setCategories([
        {
          id: '1',
          name: 'Default Category',
          route: 'Products',
          icon: 'cube-outline',
          iconColor: '#7b2ff7',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            // Open drawer - works if drawer is parent navigator
            const drawer = navigation.getParent('Drawer');
            if (drawer) {
              drawer.openDrawer();
            } else {
              navigation.openDrawer();
            }
          }}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={28} color="#7b2ff7" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/pic4.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>AUTO SHOWROOM</Text>
        </View>
        <View style={styles.menuButton} /> {/* Spacer for symmetry */}
      </View>

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 100, // space for bottom tabs
          backgroundColor: "#fff",
          flexGrow: 1,
        }}
      >

      {/* Products Section Title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Our Products</Text>
        <View style={styles.titleUnderline} />
      </View>

      {/* Categories */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7b2ff7" />
          <Text style={styles.loadingText}>Loading Categories...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            No categories found. Please check your internet connection or try again later.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchCategories}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.categoriesContainer}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                if (cat.route) {
                  navigation.navigate(cat.route);
                }
              }}
              style={styles.categoryCard}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardInner}>
                <View style={[styles.iconContainer, { borderColor: cat.iconColor + '30' }]}>
                  <View style={[styles.iconBackground, { backgroundColor: cat.iconColor + '15' }]}>
                    {cat.imageUrl ? (
                      <Image
                        source={{ uri: cat.imageUrl }}
                        style={styles.categoryImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons 
                        name={cat.icon} 
                        size={48} 
                        color={cat.iconColor} 
                      />
                    )}
                  </View>
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {cat.name}
                </Text>
                <View style={styles.categoryArrow}>
                  <Ionicons name="arrow-forward-circle" size={20} color="#7b2ff7" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#333',
  },
  sectionTitleContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#7b2ff7',
    borderRadius: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  categoryCard: {
    width: '47%',
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  categoryCardInner: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  iconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 40,
  },
  categoryArrow: {
    marginTop: 4,
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#7b2ff7",
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 50,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#7b2ff7',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#7b2ff7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
