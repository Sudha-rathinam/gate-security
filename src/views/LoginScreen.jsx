/**
 * Login screen for workforce authentication and secure access.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { Eye, EyeOff, User, Lock } from 'lucide-react-native';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';
import styles from '../styles/LoginScreenStyles.jsx';
import { COLORS } from '../config/theme';
import { setUserName } from '../utils/userState';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (text.trim()) {
      setUsernameError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.trim()) {
      setPasswordError('');
    }
  };

  const handleLogin = () => {
    let valid = true;

    if (!username.trim()) {
      setUsernameError('Username is required');
      valid = false;
    } else {
      setUsernameError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      setUserName(username.trim());
      navigation.replace('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />
      {/* Wave Background with Topography/Contour Curves */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Wave Background with Topography/Contour Curves */}
          <View style={styles.headerBackground}>
            <Svg height="100%" width="100%" viewBox="0 0 1440 240" preserveAspectRatio="none">
              {/* Main Wave */}
              <Path
                fill={COLORS.primary}
                d="M0,0 L0,180 C360,290 1080,70 1440,190 L1440,0 Z"
              />
              {/* Topographical Contour lines */}
              <Path
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="3"
                d="M0,130 C360,240 1080,20 1440,140"
              />
              <Path
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3"
                d="M0,80 C360,190 1080,-30 1440,90"
              />
              <Path
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="3"
                d="M0,30 C360,140 1080,-80 1440,40"
              />
            </Svg>
            {/* Lottie Animation */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../assets/json/login.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Sign in</Text>
              <View style={styles.titleUnderline} />
            </View>

            <CustomInput
              label="Username"
              placeholder="Enter username"
              value={username}
              onChangeText={handleUsernameChange}
              error={usernameError}
              variant="underlined"
              leftIcon={<User size={18} color={COLORS.muted} />}
            />
            <CustomInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              error={passwordError}
              variant="underlined"
              leftIcon={<Lock size={18} color={COLORS.muted} />}
              icon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                  {showPassword
                    ? <EyeOff size={18} color={COLORS.muted} />
                    : <Eye size={18} color={COLORS.muted} />}
                </TouchableOpacity>
              }
            />

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton title="Login" onPress={handleLogin} />

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an Account? </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
