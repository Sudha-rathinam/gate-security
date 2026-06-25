import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench } from 'lucide-react-native';
import { COLORS, FONTS } from '../config/theme';
import { initUserState } from '../utils/userState';
import { retrieveEncryptedData } from '../config/storage';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parallel entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous spin for background loading indicator
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    const checkSessionAndNavigate = async () => {
      try {
        await initUserState();
        const token = await retrieveEncryptedData('token');
        if (token) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        navigation.replace('Login');
      }
    };

    // Navigate after 2.8 seconds
    const timer = setTimeout(checkSessionAndNavigate, 2800);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 }}>

        {/* Animated Logo Container */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Rotating Outer Ring */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderTopColor: '#FFFFFF',
              transform: [{ rotate: spin }],
            }}
          />

          {/* Logo Center */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Wrench size={38} color={COLORS.primary} strokeWidth={2.5} />
          </View>
        </Animated.View>

        {/* Text Details */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: FONTS.inter, fontWeight: 'bold', fontSize: 16, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', paddingHorizontal: 32 }}>
            Digital Vehicle Service Operations System
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
