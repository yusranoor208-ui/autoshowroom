import { createNativeStackNavigator } from "@react-navigation/native-stack";
import 'react-native-gesture-handler';
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { persistor, store } from "./redux/store";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Escooter from "./pages/Escooter";
import ScooterDetail from "./pages/ScooterDetail";
import Cart from "./pages/Cart";
import Otp from "./pages/Otp";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import wishlist from "./pages/wishlist";   
import Chat from "./pages/Chat";   
import Reviews from "./pages/Reviews";
import Feedback from "./pages/Feedback";
import BottomTabs from "./Tabs/BottomTabs";
import Rikshaw from "./pages/Rikshaw";
import Batteries from "./pages/Batteries";
import Splashscreen from "./pages/splashscreen";
import SeedCategories from "./pages/SeedCategories";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator 
      initialRouteName="Tabs" 
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
      <Drawer.Screen 
        name="Tabs" 
        component={BottomTabs} 
        options={{ 
          title: "Home",
          headerShown: false, // Hide header for tabs since each tab will have its own
        }} 
      />
      <Drawer.Screen 
        name="wishlist" 
        component={wishlist} 
        options={({ navigation }) => ({ 
          title: "Wishlist",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })} 
      />
      <Drawer.Screen 
        name="Chat" 
        component={Chat} 
        options={({ navigation }) => ({ 
          title: "Chat",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })} 
      />
      <Drawer.Screen 
        name="Reviews" 
        component={Reviews} 
        options={({ navigation }) => ({ 
          title: "Reviews",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })} 
      />
      <Drawer.Screen 
        name="Feedback" 
        component={Feedback} 
        options={({ navigation }) => ({ 
          title: "Feedback",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })} 
      />
      <Drawer.Screen 
        name="Profile" 
        component={require('./pages/Profile').default} 
        options={({ navigation }) => ({ 
          title: "Profile",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })} 
      />
      <Drawer.Screen 
        name="SeedCategories" 
        component={SeedCategories} 
        options={({ navigation }) => ({ 
          title: "Seed Categories",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })} 
      />
    </Drawer.Navigator>
  );
}

function RenderStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Splashscreen"
      screenOptions={{ 
        headerShown: false,
      }}
    >
      {/* Splash Screen - Always first */}
      <Stack.Screen name="Splashscreen" component={Splashscreen} />
      
      {/* Auth Screens */}
      <Stack.Screen 
        name="SignUp" 
        component={SignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={Login}
        options={{ headerShown: false }}
      />
      
      {/* Main App Screens */}
      <Stack.Screen 
        name="Main" 
        component={MainDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={Checkout}
        options={{ 
          headerShown: true,
          title: "Checkout",
          headerStyle: {
            backgroundColor: '#7b2ff7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OrderSuccess" 
        component={OrderSuccess}
        options={{ 
          headerShown: true,
          title: "Order Success",
          headerStyle: {
            backgroundColor: '#7b2ff7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          headerLeft: null, // Hide back button on success page
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={Cart}
        options={{ 
          headerShown: true,
          title: "Cart",
          headerStyle: {
            backgroundColor: '#7b2ff7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Otp" 
        component={Otp}
        options={{ 
          headerShown: true,
          title: "Verify OTP",
          headerStyle: {
            backgroundColor: '#7b2ff7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RenderStack />
        </PersistGate>
      </Provider>
    </SafeAreaView>
  );
};

export default App;
