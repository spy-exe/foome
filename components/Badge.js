import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { C, F, R, S } from '../constants/theme';

export default function Badge({ value = 0, cor = C.brand, max = 99 }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (value > 0) {
      scale.value = withSequence(
        withSpring(1.4, { stiffness: 300 }),
        withSpring(1)
      );
    }
  }, [scale, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (value <= 0) return null;

  const display = value > max ? `${max}+` : String(value);

  return (
    <Animated.View style={[s.badge, { backgroundColor: cor }, animatedStyle]}>
      <Animated.Text style={s.txt}>{display}</Animated.Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: R.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: S.xs + 1,
  },
  txt: {
    fontFamily: F.monoBold,
    fontSize: 11,
    color: '#fff',
  },
});
