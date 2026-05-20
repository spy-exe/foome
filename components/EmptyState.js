import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { C, F, R, S } from '../constants/theme';
import { ICON_SIZE, ICON_COLOR_DEFAULT } from '../constants/icons';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({
  icon: Icon = Package,
  titulo,
  subtitulo,
  ctaLabel,
  onCtaPress,
}) {
  return (
    <View style={s.wrap}>
      <View style={s.iconWrap}>
        <Icon size={ICON_SIZE.xl} color={ICON_COLOR_DEFAULT} />
      </View>
      <Text style={s.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={s.sub}>{subtitulo}</Text> : null}
      {ctaLabel ? (
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} variant="outline" style={s.cta} />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: S.xxl,
    paddingHorizontal: S.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: R.lg,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: S.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  titulo: {
    fontFamily: F.uiSemi,
    fontSize: 18,
    color: C.ink,
    marginBottom: S.sm,
    textAlign: 'center',
  },
  sub: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.inkLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginTop: S.lg,
  },
});
