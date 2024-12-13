import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
// import AddNewEvent from "./Homepage/CreateEvent";
import Test from "./Homepage/Test";
import Homep from "./Homepage/Homep";
import SeeAllPage from "./Homepage/SeeAllNavigation"; 
// import CalendarPage from "./Homepage/CalendarPage";
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
// import Matchingpage from './Match/Matchingpage'
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); 


// function HomeStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* <Stack.Screen name="Homep" component={Homep} />
//       <Stack.Screen name="SeeAllPage" component={SeeAllPage} /> */}
//       {/* <Stack.Screen name="CalendarPage" component={CalendarPage} /> */}
//     </Stack.Navigator>
//   );
// }


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
      {/* <Tab.Screen name="Matchingpage" component={Matchingpage} /> */}
      <Tab.Screen name="MessagePage" component={MessagePage} />
      {/* <Tab.Screen name="Tab2" component={Test} /> */}
      {/* <Tab.Screen name="Homep" component={HomeStack} />  */}
      <Tab.Screen name="ChatDetails" component={ChatDetails} />
    </Tab.Navigator>
  );
}

export default TabsNavigation;