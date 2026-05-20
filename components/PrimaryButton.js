import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { C, F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';

export default function PrimaryButton({ label, onPress, color, disabled, loading, style, leftIcon }) {
  const bg = color ?? C.brand;
  const handlePress = () => {
    if (disabled || loading) return;
    haptic.light();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bg, shadowColor: bg }, (disabled || loading) && s.off, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
      ) : leftIcon ? (
        <View style={{ marginRight: 8 }}>{leftIcon}</View>
      ) : null}
      <Text style={s.txt}>{loading ? 'Aguarde...' : label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.float,
    shadowOpacity: 0.32,
  },
  txt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
  off: { opacity: 0.55 },
});
