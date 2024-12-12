// import * as React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import AddNewEvent from "./Homepage/CreateEvent";
// import Test from './Homepage/Test';
// import Homep from './Homepage/Homep';

// import Landing from "./auth/LandingScreen";
// import Login from "./auth/LoginScreen";
// import SignUp from "./auth/SignUpScreen";
// import ForgotPassword from "./auth/ForgotPasswordScreen";
// import Match from "./Match/Firstpagematch";
// import Matchingpage from "./Match/Matchingpage";
// import MessagePage from "./Chat/MessagePage";
// import ChatDetails from './Chat/ChatDetails';

// const Tab = createBottomTabNavigator();

// function TabsNavigation() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: { display: 'none' },
//       }}
//     >
//        <Tab.Screen name="Landing" component={Landing} />
//        <Tab.Screen name="Login" component={Login} />
//        <Tab.Screen name="SignUp " component={SignUp } />
//        <Tab.Screen name="ForgotPassword" component={ForgotPassword} />
//       <Tab.Screen name="Match" component={Match} />
//       <Tab.Screen name="Matchingpage" component={Matchingpage} />
//       <Tab.Screen name="MessagePage" component={MessagePage} />
//       <Tab.Screen name="Tab2" component={Test} />
//       <Tab.Screen name="Homep" component={Homep} />
//       <Tab.Screen name="ChatDetails" component={ChatDetails} />

//     </Tab.Navigator>
//   );
// }

// export default TabsNavigation;


import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AddNewEvent from "./Homepage/CreateEvent"
import Match from "./Match/Firstpagematch"
import Matchingpage from "./Match/Matchingpage"
import MessagePage from "./Chat/MessagePage"
import ChatDetails from './Chat/ChatDetails';


const Tab = createBottomTabNavigator();

function TabsNavigation() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#6200ee',
                    tabBarInactiveTintColor: 'gray',
                }}
            >
                <Tab.Screen name="Tab1" component={Match} />
                <Tab.Screen name="Matchingpage" component={Matchingpage} />
                <Tab.Screen name="Messages" component={MessagePage} />
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