import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Screens
import EventDetails from "./Homepage/EventDetails";
import AddNewEvent from "./Homepage/CreateEvent";
import Homep from "./Homepage/Homep";
import CategoryEvents from "./Homepage/CategoryEvents";
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
import CalendarPage from "./Homepage/CalendarPage";
import Profile from "./profile/ProfilePage";
import MarketplaceHome from "./marketplace/marketplace";
import products from "./marketplace/products";
import ProductDetail from "./marketplace/ProductDetail";
import CartScreen from "./marketplace/cart";
import PaymentScreen from './marketplace/PaymentScreen';
import PaymentSuccessScreen from './marketplace/PaymentSuccessScreen';
import DeliveryServicesScreen from './marketplace/DeliveryServicesScreen'
import { TournamentList, TournamentDetail } from './Homepage/CompetitionPage'
const Stack = createStackNavigator();
import EditProfile from "./profile/EditProfile"
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{ headerShown: false }}
        >
          {/* Auth Screens */}
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

          {/* Main Flow */}
          <Stack.Screen name="Homep" component={Homep} />
          <Stack.Screen name="CategoryEvents" component={CategoryEvents} /> 
          <Stack.Screen name="CalendarPage" component={CalendarPage} />
          <Stack.Screen name="EventDetails" component={EventDetails} />
          <Stack.Screen name="AddNewEvent" component={AddNewEvent} /> 
          <Stack.Screen name="TournamentList" component={TournamentList} /> 
          <Stack.Screen name="TournamentDetail" component={TournamentDetail} /> 

          {/* Match */}
          <Stack.Screen name="Match" component={Match} />
          <Stack.Screen name="MessagePage" component={MessagePage} />
          <Stack.Screen name="ChatDetails" component={ChatDetails} />

          {/* Profile */}
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />


          {/* Marketplace */}
          <Stack.Screen name="MarketplaceHome" component={MarketplaceHome} />
          <Stack.Screen name="products" component={products} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="delivery" component={DeliveryServicesScreen } />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
    
        </Stack.Navigator>
   
    </GestureHandlerRootView>
  );
}
