import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { C, F } from '../constants/theme';

export default function PerfilScreen() {
  return (
    <View style={s.root}>
      <Text style={s.title}>Perfil</Text>
      <Text style={s.subtitle}>Em breve...</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  title: {
    fontFamily: F.heading,
    fontSize: 18,
    color: C.ink,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: F.regular,
    fontSize: 14,
    color: C.ink3,
  },
});
