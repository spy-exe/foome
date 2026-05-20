import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PerfilScreen from '../screens/PerfilScreen';
import EnderecoScreen from '../screens/EnderecoScreen';
import PagamentosScreen from '../screens/PagamentosScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';

const Stack = createStackNavigator();

export default function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="Enderecos" component={EnderecoScreen} />
      <Stack.Screen name="Pagamentos" component={PagamentosScreen} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} />
      <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
    </Stack.Navigator>
  );
}
