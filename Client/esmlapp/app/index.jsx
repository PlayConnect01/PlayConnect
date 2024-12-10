
import * as React from 'react';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AddNewEvent from "./Homepage/CreateEvent"
const Tab = createBottomTabNavigator();
function TabsNavigation() {
    return (

        <Tab.Navigator>
          <Tab.Screen name="Tab1" component={AddNewEvent} />
         
        </Tab.Navigator>

    );
  }

  export default TabsNavigation;
