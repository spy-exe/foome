import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { C, F } from '../constants/theme';

export default function InputField({ icon, rightElement, erro, style, ...props }) {
  return (
    <View style={s.container}>
      <View style={[s.wrap, erro && s.wrapErro, style]}>
        {icon && <View style={s.iconSlot}>{icon}</View>}
        <TextInput
          style={s.input}
          placeholderTextColor={C.ink4}
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
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
  },
  wrapErro: {
    borderColor: C.brand,
    borderWidth: 1.5,
  },
  iconSlot: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: F.regular,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 0,
  },
  erroTxt: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.brand,
    marginTop: 4,
    marginLeft: 4,
  },
});
