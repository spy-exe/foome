import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import RestauranteScreen from '../screens/RestauranteScreen';
import CarrinhoScreen from '../screens/CarrinhoScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ConfirmacaoScreen from '../screens/ConfirmacaoScreen';
import RastreamentoScreen from '../screens/RastreamentoScreen';
import DetalhePedidoScreen from '../screens/DetalhePedidoScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Restaurante" component={RestauranteScreen} />
      <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Confirmacao" component={ConfirmacaoScreen} />
      <Stack.Screen name="Rastreamento" component={RastreamentoScreen} />
      <Stack.Screen name="DetalhePedido" component={DetalhePedidoScreen} />
    </Stack.Navigator>
  );
}
