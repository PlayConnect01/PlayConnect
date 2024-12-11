import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';


import AddNewEvent from "./Homepage/CreateEvent"
import Test from './Homepage/Test';
import Homep from './Homepage/Homep'
import CreateEvent from "./Homepage/CreateEvent";
import Match from "./Match/Firstpagematch"
import Matchingpage from "./Match/Matchingpage"
import MessagePage from "./Chat/MessagePage"
import ChatDetails from './Chat/ChatDetails';


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
              <Tab.Screen name="Tab1" component={Match} />
                <Tab.Screen name="Matchingpage" component={Matchingpage} />
                <Tab.Screen name="Messages" component={MessagePage} />

        <GestureHandlerRootView style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#6200ee',
                    tabBarInactiveTintColor: 'gray',
                }}
            >
               
                <Tab.Screen 
                    name="ChatDetails"
                    component={ChatDetails}
                    options={{
                        tabBarButton: () => null,
                        tabBarStyle: { display: 'none' },
                    }}
                />
            </Tab.Navigator>
        </GestureHandlerRootView>

    );
}
export default TabsNavigation;
