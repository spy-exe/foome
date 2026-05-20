import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIM, C, RADIUS } from '../constants/theme';

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.sm,
  style,
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: ANIM.slow + ANIM.normal,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: ANIM.slow + ANIM.normal,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: C.border,
          opacity,
        },
        style,
      ]}
    />
  );
}
