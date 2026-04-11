import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { C, F, SHADOW } from '../constants/theme';

export default function PrimaryButton({ label, onPress, color, disabled, style, leftIcon }) {
  const bg = color ?? C.brand;
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bg, shadowColor: bg }, disabled && s.off, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
      <Text style={s.txt}>{label}</Text>
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
