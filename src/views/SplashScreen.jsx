import React, { useEffect, useRef } from 'react';
import { Text, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/SplashScreenStyles.jsx';
import { initUserState, getUserName } from '../utils/userState';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const checkSessionAndNavigate = async () => {
      try {
        await initUserState();
        const savedUser = getUserName();
        if (savedUser) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        navigation.replace('Login');
      }
    };


    const timer = setTimeout(checkSessionAndNavigate, 2800);
    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Image
        source={require('../assets/icons/vehicle360.png')}
        style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={styles.subtitle}>Digital Vehicle Service Operations System</Text>
        <ActivityIndicator color="#0052CC" style={{ marginTop: 10 }} />
      </Animated.View>
    </SafeAreaView>
  );
}
