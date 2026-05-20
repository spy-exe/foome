import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { C, F, R } from '../constants/theme';
import { haptic } from '../utils/haptics';

export default function PrimaryButton({
  label, onPress, color, variant = 'brand',
  disabled, loading, style, leftIcon,
}) {
  const bg = variant === 'midnight' ? C.midnight
    : variant === 'outline' ? 'transparent'
    : color ?? C.brand;
  const txtColor = variant === 'outline' ? C.midnight : C.white;
  const borderColor = variant === 'outline' ? C.midnight : 'transparent';

  const handlePress = () => {
    if (disabled || loading) return;
    haptic.light();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[
        s.btn,
        { backgroundColor: bg, borderColor },
        variant === 'brand' && { shadowColor: bg },
        (disabled || loading) && s.off,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} style={{ marginRight: 8 }} />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      <Text style={[s.txt, { color: txtColor }]}>{loading ? 'Aguarde...' : label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    borderRadius: R.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  txt: { fontFamily: F.uiSemi, fontSize: 16 },
  off: { opacity: 0.5 },
});
