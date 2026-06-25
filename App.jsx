/**
 * Main application entry point for GateSecurity.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity, Animated, Dimensions, Keyboard } from 'react-native';

import SplashScreen from './src/views/SplashScreen.jsx';
import LoginScreen from './src/views/LoginScreen.jsx';
import HomeScreen from './src/views/HomeScreen.jsx';
import HistoryScreen from './src/views/HistoryScreen.jsx';
import HistoryDetailScreen from './src/views/HistoryDetailScreen.jsx';
import ProfileScreen from './src/views/ProfileScreen.jsx';
import { FONTS } from './src/config/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Home, History, User } from 'lucide-react-native';

import Svg, { Path as SvgPath } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const tabWidth = screenWidth / 3;
  const dipWidth = 96;
  const leftOffset = (tabWidth - dipWidth) / 2;

  const [translateX] = React.useState(new Animated.Value(state.index * tabWidth));
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  }, [state.index]);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={[s.tabBarContainer, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
      <Animated.View
        style={[
          s.dipIndicator,
          {
            width: dipWidth,
            left: leftOffset,
            transform: [{ translateX }],
          },
        ]}
      >
        <Svg width="96" height="48" viewBox="0 0 96 48">
          <SvgPath
            d="M 0 0 C 20 0, 24 45, 48 45 C 72 45, 76 0, 96 0 Z"
            fill="#3b82f6"
          />
        </Svg>
      </Animated.View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const renderIcon = () => {
          const color = isFocused ? '#FFFFFF' : '#64748B';
          if (route.name === 'Home') return <Home color={color} size={22} />;
          if (route.name === 'History') return <History color={color} size={22} />;
          if (route.name === 'Profile') return <User color={color} size={22} />;
          return null;
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={onLongPress}
            style={s.tabButton}
          >
            <View style={[s.iconWrapper, isFocused && { transform: [{ translateY: -5 }] }]}>
              {renderIcon()}
            </View>
            {!isFocused && (
              <Text style={[s.tabBarLabel, { color: '#64748B' }]}>
                {route.name}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 6,
    borderTopColor: '#3b82f6',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  dipIndicator: {
    position: 'absolute',
    top: -2,
    height: 48,
    zIndex: 1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    zIndex: 2,
  },
  iconWrapper: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.inter,
    marginTop: 0,
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen style={{fontFamily: FONTS.inter}} name="Home" component={HomeScreen} />
      <Tab.Screen style={{fontFamily: FONTS.inter}} name="History" component={HistoryScreen} />
      <Tab.Screen style={{fontFamily: FONTS.inter}} name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

import { StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
