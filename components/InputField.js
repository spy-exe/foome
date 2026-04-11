import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { C, F } from '../constants/theme';

export default function InputField({ icon, rightElement, style, ...props }) {
  return (
    <View style={[s.wrap, style]}>
      {icon && <View style={s.iconSlot}>{icon}</View>}
      <TextInput
        style={s.input}
        placeholderTextColor={C.ink4}
        {...props}
      />
      {rightElement || null}
    </View>
  );
}

const s = StyleSheet.create({
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
  iconSlot: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: F.regular,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 0,
  },
});
