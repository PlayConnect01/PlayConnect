import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import EventDetails from "./Homepage/EventDetails";
import AddNewEvent from "./Homepage/CreateEvent";
import Homep from './Homepage/Homep';
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
import CalendarPage from "./Homepage/CalendarPage";
import Profile from "./profile/ProfilePage";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Homep" component={Homep} />
      <Stack.Screen name="CalendarPage" component={CalendarPage} />
    </Stack.Navigator>
  );
}

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

function TabsNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Match" component={Match} />
      <Tab.Screen name="Messages" component={MessagePage} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="Main" component={TabsNavigation} />
          <Stack.Screen name="EventDetails" component={EventDetails} />
          <Stack.Screen name="AddNewEvent" component={AddNewEvent} />
          <Stack.Screen name="ChatDetails" component={ChatDetails} />
        </Stack.Navigator>
    
    </GestureHandlerRootView>
  );
}