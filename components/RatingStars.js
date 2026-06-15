import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { F, S } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

export default function RatingStars({
  valor = 0,
  max = 5,
  tamanho = 14,
  mostrarValor = true,
}) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const numericValue = Number.isFinite(Number(valor)) ? Number(valor) : 0;
  const safeMax = Math.max(0, Number.isFinite(Number(max)) ? Number(max) : 5);
  const clampedValue = Math.max(0, Math.min(numericValue, safeMax));
  const stars = [];

  for (let i = 1; i <= safeMax; i += 1) {
    const filled = clampedValue >= i;
    const half = !filled && clampedValue >= i - 0.5;
    stars.push(
      <Star
        key={i}
        size={tamanho}
        color={C.warning}
        fill={filled || half ? C.warning : 'transparent'}
      />
    );
  }

  return (
    <View style={s.row}>
      <View style={s.stars}>{stars}</View>
      {mostrarValor ? (
        <Text style={s.txt}>{clampedValue.toFixed(1)}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  txt: {
    fontFamily: F.monoMedium,
    fontSize: 13,
    color: C.ink,
    marginLeft: 2,
  },
});
