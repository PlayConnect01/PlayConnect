import * as React from "react"; 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import EventDetailsScreen from "./Homepage/EventDetails";
import CreateEventScreen from "./Homepage/CreateEvent"; 
import HomeScreen from './Homepage/Homep';
import MatchingPageScreen from "./Match/Matchingpage";
import LandingScreen from "./auth/LandingScreen";
import LoginScreen from "./auth/LoginScreen";
import SignUpScreen from "./auth/SignUpScreen";
import ForgotPasswordScreen from "./auth/ForgotPasswordScreen";
import MessagePageScreen from "./Chat/ChatDetails";
import CalendarPageScreen from "./Homepage/CalendarPage";
import ProfileScreen from "./profile/ProfilePage";
import CategoryEventsScreen from "./Homepage/EventPage";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); 

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CalendarPage" component={CalendarPageScreen} />
      <Stack.Screen name="CategoryEvents" component={CategoryEventsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function TabsNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e6e6e6",
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="MessagePage" component={MessagePageScreen} />
      <Tab.Screen name="MatchingPage" component={MatchingPageScreen} />
      <Tab.Screen name="CreateEvent" component={CreateEventScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* This is where we check if the user is authenticated */}
      <Stack.Screen name="Main" component={TabsNavigation} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}