import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS } from '../constants/theme';

const SIZES = {
  S: 36,
  M: 48,
  L: 72,
};

export default function Avatar({ uri, nome = '', tamanho = 'M' }) {
  const size = SIZES[tamanho] ?? SIZES.M;
  const fontSize = size >= SIZES.L ? 24 : size >= SIZES.M ? 18 : 14;
  const iniciais = nome
    .split(' ')
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const borderWidth = size >= SIZES.L ? 3 : 2;
  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: RADIUS.full,
    borderWidth,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[s.img, sizeStyle, { borderColor: C.brand }]}
      />
    );
  }

  return (
    <View style={[s.fallback, sizeStyle, { borderColor: C.border }]}>
      {iniciais ? (
        <Text style={[s.iniciais, { fontSize }]}>{iniciais}</Text>
      ) : (
        <Feather name="user" size={fontSize} color={C.ink3} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  img: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iniciais: {
    fontFamily: F.headingSm,
    color: C.ink2,
  },
});
