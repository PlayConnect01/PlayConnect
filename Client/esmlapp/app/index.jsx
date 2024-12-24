import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Screens
import EventDetails from "./Homepage/EventDetails";
import AddNewEvent from "./Homepage/CreateEvent";
import Homep from "./Homepage/Homep";
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import Matchingpage from "./Match/Matchingpage";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
import CalendarPage from "./Homepage/CalendarPage";
import Profile from "./profile/ProfilePage";
import MarketplaceHome from "./marketplace/marketplace";
import products from "./marketplace/products";
import ProductDetail from "./marketplace/ProductDetail";
import CartScreen from "./marketplace/cart";

const Stack = createStackNavigator();

export default function App() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            {/* Auth Screens */}
            <Stack.Screen name="Landing" component={Landing} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

            {/* Main Flow */}
            <Stack.Screen name="Homep" component={Homep} />
            <Stack.Screen name="CalendarPage" component={CalendarPage} />
            <Stack.Screen name="EventDetails" component={EventDetails} />
            <Stack.Screen name="AddNewEvent" component={AddNewEvent} />

            {/* Match */}
            <Stack.Screen name="Match" component={Match} />
            <Stack.Screen name="Matchingpage" component={Matchingpage} />

            <Stack.Screen name="MessagePage" component={MessagePage} />
            <Stack.Screen name="ChatDetails" component={ChatDetails} />
            <Stack.Screen name="Profile" component={Profile} />

            {/* Marketplace */}
            <Stack.Screen name="MarketplaceHome" component={MarketplaceHome} />
            <Stack.Screen name="products" component={products} />
            <Stack.Screen name="ProductDetail" component={ProductDetail} />
            <Stack.Screen name="CartScreen" component={CartScreen} />
          </Stack.Navigator>
     
      </GestureHandlerRootView>
  );
}
