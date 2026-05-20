import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS, SPACING } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({
  icon = 'inbox',
  titulo,
  subtitulo,
  ctaLabel,
  onCtaPress,
}) {
  return (
    <View style={s.wrap}>
      <View style={s.iconWrap}>
        <Feather name={icon} size={36} color={C.ink4} />
      </View>
      <Text style={s.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={s.sub}>{subtitulo}</Text> : null}
      {ctaLabel ? (
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} style={s.cta} />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  titulo: {
    fontFamily: F.heading,
    fontSize: 17,
    color: C.ink,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  sub: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.ink3,
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginTop: SPACING.lg,
  },
});
