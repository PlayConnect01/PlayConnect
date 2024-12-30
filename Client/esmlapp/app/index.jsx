import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainLayout from "../(Taps)/MainLayout";
import { PaymentConfiguration } from '@stripe/stripe-react-native';

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
import ProfilePage from "./profile/ProfilePage";
import MarketplaceHome from "./marketplace/marketplace";
import Products from "./marketplace/products"; // Corrected import
import ProductDetail from "./marketplace/ProductDetail";
import CartScreen from "./marketplace/cart";
import PaymentScreen from './marketplace/PaymentScreen';
import PaymentSuccessScreen from './marketplace/PaymentSuccessScreen';
import TournamentList from './Homepage/TournamentList'
import TournamentDetail from './Homepage/TournamentDetail'
import EditProfile from "./profile/EditProfile"
import DeliveryServicesScreen from './marketplace/DeliveryServicesScreen';
import FavoritesScreen from './marketplace/FavoritesScreen';
import AllDiscountedProduct from './marketplace/AllDiscountedProduct';
import CryptoPayment from './marketplace/CryptoPayment';
import BankTransferInstructions from './marketplace/BankTransferInstructions';
import orderSuccess from './marketplace/OrderConfirmation';

// Initialize Stripe
PaymentConfiguration.init({
  publishableKey: 'your-publishable-key-here', // Replace with your actual publishable key
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F8FAFF' },
          headerStyle: {
            backgroundColor: '#4FA5F5',
            shadowColor: 'transparent',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
        }}
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
        <Stack.Screen
          name="MessagePage"
          component={() => (
            <MainLayout>
              <MessagePage />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="ChatDetails"
          component={() => (
            <MainLayout>
              <ChatDetails />
            </MainLayout>
          )}
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
              <Products/>
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
          name="PaymentScreen"
          component={({ route, navigation }) => (
            <MainLayout>
              <PaymentScreen route={route} navigation={navigation} />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="DeliveryServicesScreen"
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
        <Stack.Screen
          name="FavoritesScreen"
          component={() => (
            <MainLayout>
              <FavoritesScreen/>
            </MainLayout>
          )}
        />
         <Stack.Screen
          name="AllDiscountedProduct"
          component={() => (
            <MainLayout>
              <AllDiscountedProduct />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="OrderConfirmation"
          component={({ route, navigation }) => (
            <MainLayout>
              <orderSuccess route={route} navigation={navigation} />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="BankTransferInstructions"
          component={({ route, navigation }) => (
            <MainLayout>
              <BankTransferInstructions route={route} navigation={navigation} />
            </MainLayout>
          )}
        />
        <Stack.Screen
          name="CryptoPayment"
          component={({ route, navigation }) => (
            <MainLayout>
              <CryptoPayment route={route} navigation={navigation} />
            </MainLayout>
          )}
        />

      </Stack.Navigator>
    </GestureHandlerRootView>
  );
}
