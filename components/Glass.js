import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Superfície "glassmorphism" sem dependência nativa de blur: painel translúcido
 * com borda fina, brilho sutil no topo e sombra suave. Brilha sobre fundos com
 * cor/imagem (mapa, gradientes). Use `tint` para forçar claro/escuro; por padrão
 * acompanha o tema.
 *
 * Props: tint ('light'|'dark'), intensity (0–1 opacidade do vidro), radius,
 * bordered, highlight, glow (cor de um anel de destaque opcional).
 */
export default function Glass({
  children,
  style,
  tint,
  intensity = 0.72,
  radius = 22,
  bordered = true,
  highlight = true,
  glow,
  ...rest
}) {
  const { isDark } = useTheme();
  const dark = tint ? tint === 'dark' : isDark;

  const fill = dark ? `rgba(22,22,32,${intensity})` : `rgba(255,255,255,${intensity})`;
  const borderColor = glow
    || (dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)');
  const highlightColor = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.6)';

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: fill, borderRadius: radius },
        bordered && { borderWidth: 1, borderColor },
        style,
      ]}
      {...rest}
    >
      {highlight && (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              height: 1.5,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              backgroundColor: highlightColor,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sem overflow:hidden para preservar a sombra (iOS); o borderRadius já
  // arredonda o fundo translúcido.
  base: {
    shadowColor: '#0B0B18',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
