import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddNewEvent from "./Homepage/CreateEvent";
import Test from './Homepage/Test';
import Homep from './Homepage/Homep'

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
