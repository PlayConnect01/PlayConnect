import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainLayout from "../app/(tabs)/MainLayout";

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
import MatchingPage from "./Match/Matchingpage";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
import CalendarPage from "./Homepage/CalendarPage";
import ProfilePage from "./profile/ProfilePage";
import MarketplaceHome from "./marketplace/marketplace";
import products from "./marketplace/products";
import ProductDetail from "./marketplace/ProductDetail";
import CartScreen from "./marketplace/cart";
import PaymentScreen from "./marketplace/PaymentScreen";
import PaymentSuccessScreen from "./marketplace/PaymentSuccessScreen";
// import TournamentList from './Homepage/TournamentList'
// import TournamentDetail from './Homepage/TournamentDetail'
import EditProfile from "./profile/EditProfile";
// import DeliveryServicesScreen from './marketplace/DeliveryServicesScreen';
const Stack = createStackNavigator();

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
        <Stack.Screen
          name="Homep"
          component={() => (
            <MainLayout>
              <Homep />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="TournamentList"
          component={() => (
            <MainLayout>
              <TournamentList />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="TournamentDetail"
          component={() => (
            <MainLayout>
              <TournamentDetail />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="CategoryEvents"
          component={() => (
            <MainLayout>
              <CategoryEvents />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="CalendarPage"
          component={() => (
            <MainLayout>
              <CalendarPage />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="EventDetails"
          component={() => (
            <MainLayout>
              <EventDetails />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="AddNewEvent"
          component={() => (
            <MainLayout>
              <AddNewEvent />
            </MainLayout>
          )}
        />

        {/* Match */}
        <Stack.Screen
          name="Match"
          component={() => (
            <MainLayout>
              <Match />
            </MainLayout>
          )}
        />
        <Stack.Screen name="MatchingPage" component={MatchingPage} />

        {/* Chat */}
        <Stack.Screen
          name="MessagePage"
          component={MessagePage}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="ChatDetails"
          component={ChatDetails}
          options={{
            headerShown: false
          }}
        />

        {/* Profile */}
        <Stack.Screen
          name="Profile"
          component={() => (
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="EditProfile"
          component={() => (
            <MainLayout>
              <EditProfile />
            </MainLayout>
          )}
        />

        {/* Marketplace */}
        <Stack.Screen
          name="MarketplaceHome"
          component={() => (
            <MainLayout>
              <MarketplaceHome />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="products"
          component={() => (
            <MainLayout>
              <products />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="ProductDetail"
          component={() => (
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="CartScreen"
          component={() => (
            <MainLayout>
              <CartScreen />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="Payment"
          component={() => (
            <MainLayout>
              <PaymentScreen />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="delivery"
          component={() => (
            <MainLayout>
              <DeliveryServicesScreen />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="PaymentSuccess"
          component={() => (
            <MainLayout>
              <PaymentSuccessScreen />
            </MainLayout>
          )}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
}
