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