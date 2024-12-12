import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddNewEvent from "./Homepage/CreateEvent";
import EventDetails from "./Homepage/EventDetails";
import Homep from './Homepage/Homep';
import Matchingpage from "./Match/Matchingpage"
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from './Chat/ChatDetails';

const Tab = createBottomTabNavigator();
 
function TabsNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Event Details" component={EventDetails} />
      {/* <Tab.Screen name="Create Event" component={AddNewEvent} /> */}
      <Tab.Screen name="Landing" component={Landing} />
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="SignUp " component={SignUp } />
      <Tab.Screen name="ForgotPassword" component={ForgotPassword} />
      <Tab.Screen name="Match" component={Match} />
      <Tab.Screen name="Matchingpage" component={Matchingpage} />
      <Tab.Screen name="MessagePage" component={MessagePage} />
      <Tab.Screen name="Homep" component={Homep} />
      <Tab.Screen name="ChatDetails" component={ChatDetails} />

    </Tab.Navigator>
  );
}

export default TabsNavigation;
