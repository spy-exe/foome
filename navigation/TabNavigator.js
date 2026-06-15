import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Compass, ShoppingBag, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { F } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import HomeStack from './HomeStack';
import PedidosTabIcon from './PedidosTabIcon';
import MapaScreen from '../screens/MapaScreen';
import PedidosScreen from '../screens/PedidosScreen';
import PerfilStack from './PerfilStack';

const Tab = createBottomTabNavigator();

function TabIcon({ icon: Icon, color, focused }) {
  return <Icon size={22} color={color} fill={focused ? color : 'transparent'} />;
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { C } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.midnightLight,
        tabBarStyle: {
          backgroundColor: C.midnight,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: F.ui,
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MapaTab"
        component={MapaScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Compass} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PedidosTab"
        component={PedidosScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <PedidosTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
