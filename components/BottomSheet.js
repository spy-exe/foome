import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { R, SHADOW, S } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

export default function BottomSheet({
  visivel,
  onClose,
  altura = 350,
  children,
}) {
  const s = useThemedStyles(makeStyles);
  const translateY = useRef(new Animated.Value(altura)).current;

  useEffect(() => {
    if (visivel) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: altura,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [altura, translateY, visivel]);

  if (!visivel) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, s.backdrop]}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          s.sheet,
          {
            height: altura,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={s.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    padding: S.xl,
    paddingBottom: Platform.OS === 'ios' ? 42 : S.xl,
    ...SHADOW.sheet,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: R.full,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: S.lg + 2,
  },
});
