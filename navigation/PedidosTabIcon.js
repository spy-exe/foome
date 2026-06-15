import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { F } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';
import { usePedidosCount } from '../contexts/AppContext';

export default function PedidosTabIcon({ color, focused }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
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
      <ShoppingBag size={22} color={color} fill={focused ? color : 'transparent'} />
      {count > 0 && (
        <Animated.View style={[s.badge, badgeStyle]}>
          <Text style={s.badgeTxt}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
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
    borderColor: C.midnight,
    paddingHorizontal: 4,
  },
  badgeTxt: {
    fontFamily: F.monoBold,
    fontSize: 9,
    lineHeight: 12,
    color: '#fff',
  },
});
