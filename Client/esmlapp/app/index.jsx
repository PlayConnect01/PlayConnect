import * as React from 'react';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Homep from './Homepage/Homep.jsx';
const Tab = createBottomTabNavigator();
function TabsNavigation() {
    return (
        <Tab.Navigator initialRouteName="Home">
          <Tab.Screen name="Home" component={Homep} />
         
        </Tab.Navigator>
    );
  }

  export default TabsNavigation;
