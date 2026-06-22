/**
 * Main application entry point for Vehicle360.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import SplashScreen from './src/views/SplashScreen.jsx';
import LoginScreen from './src/views/LoginScreen.jsx';
import HomeScreen from './src/views/HomeScreen.jsx';
import VehicleEntryScreen from './src/views/VehicleEntryScreen.jsx';
import HistoryScreen from './src/views/HistoryScreen.jsx';
import HistoryDetailScreen from './src/views/HistoryDetailScreen.jsx';
import ProfileScreen from './src/views/ProfileScreen.jsx';
import TodayListScreen from './src/views/TodayListScreen.jsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Home, History, User } from 'lucide-react-native';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0052CC',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={22} />;
          if (route.name === 'History') return <History color={color} size={22} />;
          if (route.name === 'Profile') return <User color={color} size={22} />;
          return null;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Entry" component={VehicleEntryScreen} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
          <Stack.Screen name="TodayList" component={TodayListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
