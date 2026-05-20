import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { C, F, R } from '../constants/theme';
import { ICON_SIZE } from '../constants/icons';

const SIZES = { sm: 32, md: 44, lg: 64, xl: 80 };

export default function Avatar({ uri, nome = '', tamanho = 'md' }) {
  const size = SIZES[tamanho] ?? SIZES.md;
  const fontSize = size >= SIZES.lg ? 24 : size >= SIZES.md ? 18 : 12;
  const iniciais = nome
    .split(' ')
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const borderWidth = size >= SIZES.lg ? 3 : 2;
  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: R.full,
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
        <User size={size * 0.4} color={C.inkLight} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  img: { overflow: 'hidden' },
  fallback: {
    backgroundColor: C.midnight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iniciais: {
    fontFamily: F.uiBold,
    color: C.offWhite,
  },
});
