import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";


import Home from "../pages/Home";
import wishlist from "../pages/wishlist";
import Cart from "../pages/Cart";
import Chat from "../pages/Chat";
import Reviews from "../pages/Reviews";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Escooter from "../pages/Escooter";
import Rikshaw from "../pages/Rikshaw";
import Batteries from "../pages/Batteries";
import ScooterDetail from "../pages/ScooterDetail";
import Profile from "../pages/Profile";

const HomeStackNav = createNativeStackNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#7b2ff7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <HomeStackNav.Screen 
        name="HomeRoot" 
        component={Home}
        options={{ 
          title: "Home",
          headerShown: false, // Hide header on home page
        }} 
      />
      <HomeStackNav.Screen 
        name="Escooter" 
        component={Escooter}
        options={{ 
          title: "E-Scooters",
        }} 
      />
      <HomeStackNav.Screen 
        name="Rikshaw" 
        component={Rikshaw}
        options={{ 
          title: "Rikshaw",
        }} 
      />
      <HomeStackNav.Screen 
        name="Batteries" 
        component={Batteries}
        options={{ 
          title: "Batteries",
        }} 
      />
      <HomeStackNav.Screen 
        name="ScooterDetail" 
        component={ScooterDetail}
        options={{ 
          title: "Product Details",
        }} 
      />
    </HomeStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function BottomTabs({ navigation }) {
  const cartCount = useSelector((state) => state.home.cartCount);
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Cart") {
            iconName = "cart";
          } else if (route.name === "Chat") {
            iconName = "chatbubbles";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return <Ionicons name={focused ? iconName : iconName + "-outline"} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6C63FF",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: false,
        tabBarStyle: { height: 60, paddingBottom: 6 },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#7b2ff7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ 
          title: "Home",
          headerShown: false, // HomeStack will handle its own header
        }} 
      />
      <Tab.Screen 
        name="Cart" 
        component={Cart}
        options={({ navigation, route }) => ({
          title: "Cart",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#e74c3c", color: "white" },
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null
          ),
        })}
      />
      <Tab.Screen 
        name="Chat" 
        component={Chat}
        options={({ navigation }) => ({ 
          title: "Chat",
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null
          ),
        })} 
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={({ navigation }) => ({ 
          title: "Profile",
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null
          ),
        })} 
      />
    </Tab.Navigator>
  );
}
