import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

export default function SkeletonShimmer({ style }) {
  const s = useThemedStyles(makeStyles);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-120, 260]) }],
  }));

  return (
    <View style={[s.base, style]}>
      <Animated.View style={[s.shimmer, shimmerStyle]} />
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: C.surfaceAlt,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 86,
    backgroundColor: C.midnightLight,
    transform: [{ rotate: '12deg' }],
  },
});
