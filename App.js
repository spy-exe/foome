import React, { useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

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

import LoginScreen       from './screens/LoginScreen';
import CadastroScreen    from './screens/CadastroScreen';
import HomeScreen        from './screens/HomeScreen';
import RestauranteScreen from './screens/RestauranteScreen';
import CarrinhoScreen    from './screens/CarrinhoScreen';
import PedidosScreen     from './screens/PedidosScreen';
import DetalhePedidoScreen from './screens/DetalhePedidoScreen';
import MapaScreen        from './screens/MapaScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular':      Inter_400Regular,
    'Inter-Medium':       Inter_500Medium,
    'Inter-SemiBold':     Inter_600SemiBold,
    'Inter-Bold':         Inter_700Bold,
    'Poppins-SemiBold':   Poppins_600SemiBold,
    'Poppins-Bold':       Poppins_700Bold,
    'Poppins-ExtraBold':  Poppins_800ExtraBold,
  });

  const onReady = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onReady}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
          <Stack.Screen name="Login"       component={LoginScreen} />
          <Stack.Screen name="Cadastro"    component={CadastroScreen} />
          <Stack.Screen name="App"         component={HomeScreen} />
          <Stack.Screen name="Home"        component={HomeScreen} />
          <Stack.Screen name="Restaurante" component={RestauranteScreen} />
          <Stack.Screen name="Carrinho"    component={CarrinhoScreen} />
          <Stack.Screen name="Pedidos"     component={PedidosScreen} />
          <Stack.Screen name="DetalhePedido" component={DetalhePedidoScreen} />
          <Stack.Screen name="Mapa"        component={MapaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
