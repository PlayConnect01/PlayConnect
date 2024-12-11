
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import pages
import Landing from "./auth/LandingScreen";
import Login from "./auth/LoginScreen";
import SignUp from "./auth/SignUpScreen";
import ForgotPassword from "./auth/ForgotPasswordScreen";
import Home from "./auth/HomeScreen";
import CreateEvent from "./Homepage/CreateEvent";
import Test from "./Homepage/Test";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
   
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CreateEvent" component={CreateEvent} />
        <Stack.Screen name="Test" component={Test} />
      </Stack.Navigator>
    
  );
};

export default App;