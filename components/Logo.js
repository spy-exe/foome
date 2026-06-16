import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, Mask, Rect, Circle, Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { F } from '../constants/theme';

/**
 * Logo do Foome.
 *
 * Conceito: "a fome que fala". O símbolo é um balão de fala ("fala") em cor de
 * marca com uma mordida recortada no canto ("fome") e um rostinho (os "oo" do
 * nome viram olhos) — faminto, imediato, pessoal e simpático. Uma fagulha
 * "limão" marca a mordida.
 *
 * Props:
 *  - size: altura do símbolo (px)
 *  - variant: 'full' (símbolo + wordmark) | 'symbol' | 'wordmark'
 *  - color: cor do símbolo (default = marca do tema)
 *  - faceColor: cor do rosto/recorte (default branco)
 *  - accentColor: cor da fagulha (default accent do tema)
 *  - wordmarkColor: cor do texto "Foome" (default ink do tema)
 */
export default function Logo({
  size = 40,
  variant = 'full',
  color,
  faceColor = '#FFFFFF',
  accentColor,
  wordmarkColor,
}) {
  const { C } = useTheme();
  const brand = color || C.brand;
  const accent = accentColor || C.accent;
  const ink = wordmarkColor || C.ink;

  const Simbolo = (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <Mask id="foomeBite">
          {/* área visível do balão */}
          <Rect x="2" y="2" width="44" height="44" rx="15" fill="#fff" />
          {/* mordida (buraco) no canto superior direito */}
          <Circle cx="44" cy="6" r="9.5" fill="#000" />
        </Mask>
      </Defs>

      {/* tile / balão de fala */}
      <Rect x="2" y="2" width="44" height="44" rx="15" fill={brand} mask="url(#foomeBite)" />
      {/* cauda do balão (canto inferior esquerdo) */}
      <Path d="M12 40 L8 46 L18 42 Z" fill={brand} />

      {/* fagulha "limão" na mordida */}
      <Circle cx="43" cy="7" r="3.4" fill={accent} />

      {/* rosto: olhos (os "oo") + sorriso */}
      <Circle cx="19" cy="22" r="2.7" fill={faceColor} />
      <Circle cx="29" cy="22" r="2.7" fill={faceColor} />
      <Path
        d="M16.5 29 Q24 36 31.5 29"
        stroke={faceColor}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );

  const Wordmark = (
    <Text
      style={{
        fontFamily: F.headingLg,
        fontSize: size * 0.62,
        color: ink,
        letterSpacing: -0.5,
        includeFontPadding: false,
      }}
    >
      Foome
    </Text>
  );

  if (variant === 'symbol') return Simbolo;
  if (variant === 'wordmark') return Wordmark;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.22 }}>
      {Simbolo}
      {Wordmark}
    </View>
  );
}
