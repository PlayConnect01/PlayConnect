import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Homep from "./Homepage/Homep";
import SeeAllNavigation from "./Homepage/SeeAllNavigation";  // Assuming this imports the navigator that leads to SeeAllPage
import CalendarPage from "./Homepage/CalendarPage.jsx";
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create the Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Homep" component={Homep} />
      <Stack.Screen name="SeeAllPage" component={SeeAllNavigation} />
      <Stack.Screen name="CalendarPage" component={CalendarPage} />
    </Stack.Navigator>
  );
}

function TabsNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tab.Screen name="Landing" component={Landing} />
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="SignUp" component={SignUp} />
      <Tab.Screen name="ForgotPassword" component={ForgotPassword} />
      <Tab.Screen name="Match" component={Match} />
      <Tab.Screen name="MessagePage" component={MessagePage} />
      <Tab.Screen name="HomeStack" component={HomeStack} />
      
      <Tab.Screen name="ChatDetails" component={ChatDetails} />
    </Tab.Navigator>
  );
}

export default TabsNavigation;
