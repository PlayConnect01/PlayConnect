import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import AddNewEvent from "./Homepage/CreateEvent"
import Test from './Homepage/Test';
import Homep from './Homepage/Homep'
import CreateEvent from "./Homepage/CreateEvent";

// Import pages auth
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";

const Tab = createBottomTabNavigator();
function TabsNavigation() {
    return (
        <Tab.Navigator 
             initialRouteName="Landing"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false ,
                tabBarStyle: { 
                  display: 'none', 
                }
            }}
        >
        
        <Tab.Screen name="Landing" component={Landing} />
        <Tab.Screen name="Login" component={Login} />
        <Tab.Screen name="SignUp" component={SignUp} />
        <Tab.Screen name="ForgotPassword" component={ForgotPassword} />
        <Tab.Screen name="Homep" component={Homep} />
        <Tab.Screen name="CreateEvent" component={CreateEvent} />
        <Tab.Screen name="Test" component={Test} />
          <Tab.Screen name="Create Event" component={AddNewEvent} />
          <Tab.Screen name="Tab2" component={Test} />
        </Tab.Navigator>
    );
}
export default TabsNavigation;
