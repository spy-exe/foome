import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { C, F, R, S } from '../constants/theme';

export default function InputField({ icon, rightElement, erro, label, style, ...props }) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={s.container}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[
        s.wrap,
        focado && !erro && s.wrapFocus,
        erro && s.wrapErro,
        style,
      ]}>
        {icon && <View style={{ marginRight: S.sm }}>{icon}</View>}
        <TextInput
          style={s.input}
          placeholderTextColor={C.inkLight}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          {...props}
        />
        {rightElement || null}
      </View>
      {erro ? <Text style={s.erroTxt}>{erro}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { width: '100%' },
  label: {
    fontFamily: F.uiMedium,
    fontSize: 13,
    color: C.inkMid,
    marginBottom: 6,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: S.md,
    height: 52,
  },
  wrapFocus: {
    borderColor: C.midnight,
    borderWidth: 1.5,
  },
  wrapErro: {
    borderColor: C.error,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 0,
  },
  erroTxt: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: C.error,
    marginTop: S.xs,
    marginLeft: S.xs,
  },
});
