import * as React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import MainLayout from "../(Taps)/MainLayout";
import { StripeProvider } from '@stripe/stripe-react-native';

// Screens
import EventDetails from "./Homepage/EventDetails";
import AddNewEvent from "./Homepage/CreateEvent";
import Homep from "./Homepage/Homep";
import CompetitionPage from "./Homepage/CompetitionPage";
import TournamentDetail from "./Homepage/TournamentDetail";
import CategoryEvents from "./Homepage/CategoryEvents";
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Match from "./Match/Firstpagematch";
import Matchingpage from "./Match/Matchingpage";
import MessagePage from "./Chat/MessagePage";
import ChatDetails from "./Chat/ChatDetails";
import CalendarPage from "./Homepage/CalendarPage";
import ProfilePage from "./profile/ProfilePage";
import Marketplace from "./marketplace/marketplace";
import Products from "./marketplace/products";
import ProductDetail from "./marketplace/ProductDetail";
import CartScreen from "./marketplace/cart";
import PaymentScreen from './marketplace/payment/PaymentScreen';
import PaymentSuccess from './marketplace/payment/PaymentSuccess';
import TournamentList from './Homepage/TournamentList';
import EditProfile from "./profile/EditProfile";
import DeliveryServicesScreen from './marketplace/payment/DeliveryServicesScreen';
import OrdersScreen from './marketplace/orders/OrdersScreen';
import OrderDetails from './marketplace/orders/OrderDetails';
import First from "./FirstPage/First";
import FavoritesScreen from "./marketplace/FavoritesScreen";
import AllDiscountedProducts from "./marketplace/AllDiscountedProduct";
import GymProducts from "./marketplace/categories/GymProducts";
import CricketProducts from "./marketplace/categories/CricketProducts";
import RowingProducts from "./marketplace/categories/RowingProducts";
import SkatingProducts from "./marketplace/categories/SkatingProducts";
import ESportsProducts from "./marketplace/categories/ESportsProducts";
import FootballProducts from "./marketplace/categories/FootballProducts";
import BasketballProducts from "./marketplace/categories/BasketballProducts";
import TrophiesProducts from "./marketplace/categories/TrophiesProducts";
import WalkingProducts from "./marketplace/categories/WalkingProducts";
import BaseballProducts from "./marketplace/categories/BaseballProducts";
import HockeyProducts from "./marketplace/categories/HockeyProducts";
import MMAProducts from "./marketplace/categories/MMAProducts";
import TennisProducts from "./marketplace/categories/TennisProducts";

import UserProducts from './marketplace/UserProducts';

const Stack = createStackNavigator();

// Wrap components with MainLayout
const withMainLayout = (Component) => {
  return function WrappedComponent(props) {
    return (
      <MainLayout>
        <Component {...props} />
      </MainLayout>
    );
  };
};

// Create wrapped versions of components
const WrappedHomep = withMainLayout(Homep);
const WrappedCompetitionPage = withMainLayout(CompetitionPage);
const WrappedTournamentList = withMainLayout(TournamentList);
const WrappedTournamentDetail = withMainLayout(TournamentDetail);
const WrappedCategoryEvents = withMainLayout(CategoryEvents);
const WrappedCalendarPage = withMainLayout(CalendarPage);
const WrappedMatch = withMainLayout(Match);
const WrappedMatchingpage = withMainLayout(Matchingpage);
const WrappedMessagePage = withMainLayout(MessagePage);
const WrappedChatDetails = withMainLayout(ChatDetails);
const WrappedProfilePage = withMainLayout(ProfilePage);
const WrappedEditProfile = withMainLayout(EditProfile);
const WrappedMarketplace = withMainLayout(Marketplace);
const WrappedProducts = withMainLayout(Products);
const WrappedProductDetail = withMainLayout(ProductDetail);
const WrappedCartScreen = withMainLayout(CartScreen);
const WrappedPaymentScreen = withMainLayout(PaymentScreen);
const WrappedPaymentSuccess = withMainLayout(PaymentSuccess);
const WrappedDeliveryServices = withMainLayout(DeliveryServicesScreen);
const WrappedOrdersScreen = withMainLayout(OrdersScreen);
const WrappedOrderDetails = withMainLayout(OrderDetails);
const WrappedFavoritesScreen = withMainLayout(FavoritesScreen);

const WrappedUserProducts = withMainLayout(UserProducts);
const WrappedAllDiscountedProducts = withMainLayout(AllDiscountedProducts);
const WrappedGymProducts = withMainLayout(GymProducts);
const WrappedCricketProducts = withMainLayout(CricketProducts);
const WrappedRowingProducts = withMainLayout(RowingProducts);
const WrappedSkatingProducts = withMainLayout(SkatingProducts);
const WrappedESportsProducts = withMainLayout(ESportsProducts);
const WrappedFootballProducts = withMainLayout(FootballProducts);
const WrappedBasketballProducts = withMainLayout(BasketballProducts);
const WrappedTrophiesProducts = withMainLayout(TrophiesProducts);
const WrappedWalkingProducts = withMainLayout(WalkingProducts);
const WrappedBaseballProducts = withMainLayout(BaseballProducts);
const WrappedHockeyProducts = withMainLayout(HockeyProducts);
const WrappedMMAProducts = withMainLayout(MMAProducts);
const WrappedTennisProducts = withMainLayout(TennisProducts);

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="First"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F8FAFF' },
                contentStyle: { backgroundColor: '#F8FAFF' },
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
              <Stack.Screen name="First" component={First} />
              <Stack.Screen name="Landing" component={Landing} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

              {/* Main Flow */}
              <Stack.Screen name="Home" component={WrappedHomep} />
              <Stack.Screen name="CompetitionPage" component={WrappedCompetitionPage} />
              <Stack.Screen name="TournamentList" component={WrappedTournamentList} />
              <Stack.Screen name="TournamentDetail" component={WrappedTournamentDetail} />
              <Stack.Screen name="CategoryEvents" component={WrappedCategoryEvents} />
              <Stack.Screen name="CalendarPage" component={WrappedCalendarPage} />
              <Stack.Screen name="EventDetails" component={EventDetails} />
              <Stack.Screen name="AddNewEvent" component={AddNewEvent} />
              <Stack.Screen name="Match" component={WrappedMatch} />
              <Stack.Screen name="Matchingpage" component={WrappedMatchingpage} />
              <Stack.Screen name="Messages" component={WrappedMessagePage} />
              <Stack.Screen name="ChatDetails" component={WrappedChatDetails} />
              <Stack.Screen name="Profile" component={WrappedProfilePage} />
              <Stack.Screen name="EditProfile" component={WrappedEditProfile} />
              
              {/* Marketplace Flow */}
              <Stack.Screen name="Marketplace" component={WrappedMarketplace} />
              <Stack.Screen name="Products" component={WrappedProducts} />
              <Stack.Screen name="ProductDetail" component={WrappedProductDetail} />
              <Stack.Screen name="Cart" component={WrappedCartScreen} />
              <Stack.Screen name="Favorites" component={WrappedFavoritesScreen} />
              <Stack.Screen name="Payment" component={WrappedPaymentScreen} />
              <Stack.Screen name="PaymentSuccess" component={WrappedPaymentSuccess} />
              <Stack.Screen name="DeliveryServices" component={WrappedDeliveryServices} />
              <Stack.Screen name="Orders" component={WrappedOrdersScreen} />
              <Stack.Screen name="OrderDetails" component={WrappedOrderDetails} />
              <Stack.Screen name="AllDiscountedProducts" component={WrappedAllDiscountedProducts} />
              <Stack.Screen name="GymProducts" component={WrappedGymProducts} options={{ headerShown: true, title: 'Gym Equipment' }} />
              <Stack.Screen name="CricketProducts" component={WrappedCricketProducts} options={{ headerShown: true, title: 'Cricket Equipment' }} />
              <Stack.Screen name="RowingProducts" component={WrappedRowingProducts} options={{ headerShown: true, title: 'Rowing Equipment' }} />
              <Stack.Screen name="SkatingProducts" component={WrappedSkatingProducts} options={{ headerShown: true, title: 'Skating Equipment' }} />
              <Stack.Screen name="ESportsProducts" component={WrappedESportsProducts} options={{ headerShown: true, title: 'E-Sports Equipment' }} />
              <Stack.Screen name="FootballProducts" component={WrappedFootballProducts} options={{ headerShown: true, title: 'Football Equipment' }} />
              <Stack.Screen name="BasketballProducts" component={WrappedBasketballProducts} options={{ headerShown: true, title: 'Basketball Equipment' }} />
              <Stack.Screen name="TrophiesProducts" component={WrappedTrophiesProducts} options={{ headerShown: true, title: 'Trophies & Awards' }} />
              <Stack.Screen name="WalkingProducts" component={WrappedWalkingProducts} options={{ headerShown: true, title: 'Walking Equipment' }} />
              <Stack.Screen name="BaseballProducts" component={WrappedBaseballProducts} options={{ headerShown: true, title: 'Baseball Equipment' }} />
              <Stack.Screen name="HockeyProducts" component={WrappedHockeyProducts} options={{ headerShown: true, title: 'Hockey Equipment' }} />
              <Stack.Screen name="MMAProducts" component={WrappedMMAProducts} options={{ headerShown: true, title: 'MMA Equipment' }} />
              <Stack.Screen name="TennisProducts" component={WrappedTennisProducts} options={{ headerShown: true, title: 'Tennis Equipment' }} />
              <Stack.Screen name="UserProducts" component={WrappedUserProducts} options={{ headerShown: true, title: 'My Products' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </StripeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;