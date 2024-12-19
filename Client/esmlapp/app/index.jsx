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
import Home from "./marketplace/Home";
import products from "./marketplace/products ";



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); 

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

function MainNavigation() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: false,
      }}
    >
      {/* Auth Screens */}
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      {/* Main Flow */}
      <Stack.Screen name="Match" component={Match} />
      <Stack.Screen name="Matchingpage" component={Matchingpage} />
      <Stack.Screen name="MessagePage" component={MessagePage} />
      <Stack.Screen name="ChatDetails" component={ChatDetails} />

      {/* Other Screens */}
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Home" component={HomeStack} />
      <Stack.Screen name="Create Event" component={AddNewEvent} />
      <Stack.Screen name="Event Details" component={EventDetails} />
    </Stack.Navigator>
  );
}

export default MainNavigation;
