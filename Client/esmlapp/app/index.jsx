import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddNewEvent from "./Homepage/CreateEvent";
import Test from './Homepage/Test';
import Homep from './Homepage/Homep';

import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import Matchingpage from "./Match/Matchingpage";
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
      <Tab.Screen name="Create Event" component={AddNewEvent} />
      <Tab.Screen name="Tab2" component={Test} />
      <Tab.Screen name="Homep" component={Homep} />

    </Tab.Navigator>
  );
}

export default TabsNavigation;
