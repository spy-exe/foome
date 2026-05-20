import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { C, F } from '../constants/theme';
import HomeStack from './HomeStack';
import PedidosTabIcon from './PedidosTabIcon';
import MapaScreen from '../screens/MapaScreen';
import PedidosScreen from '../screens/PedidosScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ color, focused, name, outlineName, size }) {
  return (
    <Ionicons
      name={focused ? name : outlineName}
      size={size}
      color={color}
    />
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.ink3,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontFamily: F.medium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={color} focused={focused} name="home" outlineName="home-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MapaTab"
        component={MapaScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={color} focused={focused} name="map" outlineName="map-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PedidosTab"
        component={PedidosScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ color, focused, size }) => (
            <PedidosTabIcon color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={color} focused={focused} name="person" outlineName="person-outline" size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
