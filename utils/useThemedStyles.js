import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Recebe uma factory `makeStyles(C)` (definida no escopo do módulo) e devolve
 * o StyleSheet recomputado sempre que o tema (claro/escuro) muda.
 *
 * Uso no componente:
 *   const { C } = useTheme();
 *   const s = useThemedStyles(makeStyles);
 */
export function useThemedStyles(makeStyles) {
  const { C } = useTheme();
  return useMemo(() => makeStyles(C), [makeStyles, C]);
}
