import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, SPACING } from '../constants/theme';

export default function RatingStars({
  valor = 0,
  max = 5,
  tamanho = 14,
  mostrarValor = true,
}) {
  const numericValue = Number.isFinite(Number(valor)) ? Number(valor) : 0;
  const safeMax = Math.max(0, Number.isFinite(Number(max)) ? Number(max) : 5);
  const clampedValue = Math.max(0, Math.min(numericValue, safeMax));
  const stars = [];

  for (let i = 1; i <= safeMax; i += 1) {
    if (clampedValue >= i) {
      stars.push(<Ionicons key={i} name="star" size={tamanho} color={C.amber} />);
    } else if (clampedValue >= i - 0.5) {
      stars.push(<Ionicons key={i} name="star-half" size={tamanho} color={C.amber} />);
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={tamanho} color={C.ink4} />);
    }
  }

  return (
    <View style={s.row}>
      <View style={s.stars}>{stars}</View>
      {mostrarValor ? <Text style={s.txt}>{clampedValue.toFixed(1)}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  txt: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#92530A',
    marginLeft: 2,
  },
});
