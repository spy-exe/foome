import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { C, F } from '../constants/theme';
import { usePedidosCount } from '../contexts/AppContext';

export default function PedidosTabIcon({ color, focused, size }) {
  const count = usePedidosCount();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.25, { damping: 10, stiffness: 220 }),
        withSpring(1, { damping: 12, stiffness: 220 }),
      );
    }
  }, [count, scale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={s.wrap}>
      <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
      {count > 0 && (
        <Animated.View style={[s.badge, badgeStyle]}>
          <Text style={s.badgeTxt}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.brand,
    borderWidth: 2,
    borderColor: C.surface,
    paddingHorizontal: 4,
  },
  badgeTxt: {
    fontFamily: F.bold,
    fontSize: 9,
    lineHeight: 12,
    color: '#fff',
  },
});
