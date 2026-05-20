import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ANIM, C, F, RADIUS, SPACING } from '../constants/theme';

const CONFIG = {
  sucesso: { bg: C.tealLight, icon: 'check-circle', cor: C.teal, iconeCor: C.teal },
  erro: { bg: C.brandLight, icon: 'alert-circle', cor: C.brand, iconeCor: C.brand },
  info: { bg: C.bg, icon: 'info', cor: C.ink, iconeCor: C.ink2 },
};

export default function Toast({
  tipo = 'info',
  mensagem,
  visivel,
  duracao = 3000,
  onClose,
}) {
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
        duration: ANIM.normal,
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

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          backgroundColor: cfg.bg,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Feather name={cfg.icon} size={18} color={cfg.iconeCor} />
      <Text style={[s.txt, { color: cfg.cor }]} numberOfLines={2}>
        {mensagem}
      </Text>
      <TouchableOpacity
        onPress={onClose}
        hitSlop={{ top: SPACING.sm, bottom: SPACING.sm, left: SPACING.sm, right: SPACING.sm }}
      >
        <Feather name="x" size={16} color={cfg.iconeCor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  txt: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
