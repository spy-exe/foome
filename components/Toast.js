import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '../constants/theme';

const CONFIG = {
  sucesso: { bg: C.tealLight, icon: 'check-circle', color: C.teal },
  erro: { bg: C.brandLight, icon: 'alert-circle', color: C.brand },
  info: { bg: C.bg, icon: 'info', color: C.ink },
};

export default function Toast({ tipo = 'info', mensagem, visivel, duracao = 3000, onClose }) {
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
      <Feather name={cfg.icon} size={18} color={cfg.color} />
      <Text style={[s.txt, { color: cfg.color }]} numberOfLines={2}>
        {mensagem}
      </Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="x" size={16} color={cfg.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  txt: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
