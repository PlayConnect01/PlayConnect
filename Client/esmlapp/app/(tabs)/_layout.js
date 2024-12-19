import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="SignUp" />
      <Tabs.Screen name="Login" />
      <Tabs.Screen name="ForgotPassword" />
      <Tabs.Screen name="Match" />
      <Tabs.Screen name="Matchingpage" />
      <Tabs.Screen name="MessagePage" />
      <Tabs.Screen name="ChatDetails" />
    </Tabs>
  );
}
