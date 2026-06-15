import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Utensils } from 'lucide-react-native';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import LoginScreen       from './screens/LoginScreen';
import CadastroScreen    from './screens/CadastroScreen';
import OnboardingScreen  from './screens/OnboardingScreen';
import TabNavigator      from './navigation/TabNavigator';
import { AppProvider, useApp } from './contexts/AppContext';
import { CarrinhoProvider } from './contexts/CarrinhoContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { C, F } from './constants/theme';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

function RootNavigator() {
  const { usuario, carregando } = useApp();

  if (carregando) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: { duration: 350 },
          },
          close: {
            animation: 'timing',
            config: { duration: 300 },
          },
        },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {usuario ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function SplashAnimada({ onFinish, onLayout }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish, opacity, scale]);

  return (
    <View
      onLayout={onLayout}
      style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}
    >
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <View style={{
          width: 90,
          height: 90,
          borderRadius: 28,
          backgroundColor: C.brandLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          borderWidth: 2,
          borderColor: C.brandLight,
        }}>
          <Utensils size={44} color={C.brand} />
        </View>
        <Text style={{ fontFamily: F.uiBold, fontSize: 40, color: C.brand }}>
          Foome
        </Text>
        <Text style={{ fontFamily: F.body, fontSize: 14, color: C.inkLight, marginTop: 6 }}>
          Comida boa, na hora certa.
        </Text>
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular, Inter_500Medium,
    Inter_600SemiBold, Inter_700Bold,
    Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [onboardingFeito, setOnboardingFeito] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@foome_onboarding_done')
      .then(valor => setOnboardingFeito(valor === 'true'))
      .catch(() => setOnboardingFeito(false));
  }, []);

  const onReady = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);
  const finalizarSplash = useCallback(() => setMostrarSplash(false), []);

  if (!fontsLoaded && !fontError) return null;
  if (mostrarSplash) {
    return <SplashAnimada onLayout={onReady} onFinish={finalizarSplash} />;
  }
  if (onboardingFeito === null) return null;

  return (
    <ThemeProvider>
      <AppProvider>
        <CarrinhoProvider>
          <View style={{ flex: 1 }} onLayout={onReady}>
            {!onboardingFeito ? (
              <OnboardingScreen onFinish={() => setOnboardingFeito(true)} />
            ) : (
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            )}
          </View>
        </CarrinhoProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
