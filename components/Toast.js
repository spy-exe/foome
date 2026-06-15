import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle, Bell, X } from 'lucide-react-native';
import { F, R, S } from '../constants/theme';
import { ICON_SIZE } from '../constants/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const makeConfig = (C) => ({
  sucesso: { bg: C.success, icon: CheckCircle2 },
  erro: { bg: C.error, icon: AlertCircle },
  info: { bg: C.info, icon: Bell },
});

export default function Toast({ tipo = 'info', mensagem, visivel, duracao = 3000, onClose }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const CONFIG = makeConfig(C);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visivel) return undefined;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onClose?.());
    }, duracao);

    return () => clearTimeout(timer);
  }, [duracao, onClose, opacity, translateY, visivel]);

  if (!visivel) return null;

  const cfg = CONFIG[tipo] ?? CONFIG.info;
  const Icon = cfg.icon;

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          backgroundColor: cfg.bg,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Icon size={ICON_SIZE.md} color={C.white} />
      <Text style={s.txt} numberOfLines={2}>
        {mensagem}
      </Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <X size={ICON_SIZE.sm} color={C.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderRadius: R.lg,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  txt: {
    flex: 1,
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: C.white,
    lineHeight: 20,
  },
});
