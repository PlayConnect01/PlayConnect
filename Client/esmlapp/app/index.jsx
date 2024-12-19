import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Screens
import EventDetails from "./Homepage/EventDetails";
import AddNewEvent from "./Homepage/CreateEvent";
import Homep from "./Homepage/Homep";
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
import CalendarPage from "./Homepage/CalendarPage";
import Profile from "./profile/ProfilePage";
import MarketplaceHome from "./marketplace/Home";
import products from "./marketplace/products";
import ProductDetail from './marketplace/ProductDetail'
import CartScreen from './marketplace/cart'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Homep" component={Homep} />
      <Stack.Screen name="CalendarPage" component={CalendarPage} />
      <Stack.Screen name="EventDetails" component={EventDetails} />
      <Stack.Screen name="AddNewEvent" component={AddNewEvent} />
    </Stack.Navigator>
  );
}

// Authentication Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}

// Marketplace Stack
function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceHome" component={MarketplaceHome} />
      <Stack.Screen name="products" component={products} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
     
    </Stack.Navigator>
  );
}

// Bottom Tabs Navigation
function TabsNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="MatchTab" component={Match} />
      <Tab.Screen name="MessagesTab" component={MessagePage} />
      <Tab.Screen name="MarketplaceTab" component={MarketplaceStack} />
      <Tab.Screen name="ProfileTab" component={Profile} />
    </Tab.Navigator>
  );
}

// Root App Navigation
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={TabsNavigation} />
        <Stack.Screen name="ChatDetails" component={ChatDetails} />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
}
