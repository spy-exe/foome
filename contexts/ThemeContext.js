import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C as lightColors } from '../constants/theme';

const darkColors = {
  brand: '#FF4D66',
  brandDark: '#DB1C39',
  brandLight: '#2C1419',

  accent: '#CDF564',
  accentDark: '#A9D63B',
  accentLight: '#23280F',

  ink: '#F0F0F0',
  inkMid: '#B0B0B0',
  inkLight: '#707070',

  midnight: '#0F0F1A',
  midnightMid: '#1A1A30',
  midnightLight: '#4A4A5E',

  white: '#121212',
  offWhite: '#1A1A1A',
  surface: '#1E1E1E',
  surfaceAlt: '#2A2A2A',
  border: '#333333',
  borderDark: '#444444',

  success: '#22C55E',
  successLight: '#1A2E1A',
  warning: '#F59E0B',
  warningLight: '#2E2A1A',
  error: '#EF4444',
  errorLight: '#2E1A1A',
  info: '#3B82F6',
  infoLight: '#1A1A2E',

  // Backward-compatible aliases
  brandBorder: '#3A1A22',
  ink2: '#B0B0B0',
  ink3: '#707070',
  ink4: '#4A4A5E',
  bg: '#1A1A1A',
  amber: '#F59E0B',
  amberLight: '#2E2A1A',
  teal: '#22C55E',
  tealLight: '#1A2E1A',
  midnightSurface: '#1A1A30',
};

// Valor padrão (tema claro) para componentes usados fora do provider — ex.: a
// splash, que renderiza antes da árvore de providers, e os testes isolados.
const noop = () => {};
const ThemeContext = createContext({
  C: lightColors,
  isDark: false,
  modo: 'light',
  preferencia: 'system',
  reset: noop,
  setTema: noop,
  toggle: noop,
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preferencia, setPreferencia] = useState('system');

  useEffect(() => {
    AsyncStorage.getItem('@foome_tema').then(valor => {
      if (valor === 'dark' || valor === 'light') setPreferencia(valor);
      else setPreferencia('system');
    });
  }, []);

  const isDark = preferencia === 'dark'
    || (preferencia === 'system' && systemScheme === 'dark');
  const C = isDark ? darkColors : lightColors;

  const setTema = useCallback(async (novoTema) => {
    if (novoTema === 'dark' || novoTema === 'light') {
      setPreferencia(novoTema);
      await AsyncStorage.setItem('@foome_tema', novoTema);
      return;
    }

    setPreferencia('system');
    await AsyncStorage.removeItem('@foome_tema');
  }, []);

  const toggle = useCallback(async () => {
    await setTema(isDark ? 'light' : 'dark');
  }, [isDark, setTema]);

  const reset = useCallback(async () => {
    await setTema('system');
  }, [setTema]);

  const value = useMemo(() => ({
    C,
    isDark,
    modo: isDark ? 'dark' : 'light',
    preferencia,
    reset,
    setTema,
    toggle,
  }), [C, isDark, preferencia, reset, setTema, toggle]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
