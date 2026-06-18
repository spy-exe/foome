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
  brand: '#FF405C',
  brandDark: '#E12A46',
  brandLight: '#321018',

  accent: '#CDF564',
  accentDark: '#B7E84A',
  accentLight: '#263211',

  ink: '#FFF7F5',
  inkMid: '#D0C2BE',
  inkLight: '#8F7F7C',

  midnight: '#110B14',
  midnightMid: '#201426',
  midnightLight: '#4E3A55',

  white: '#0E0A0F',
  offWhite: '#100A0D',
  surface: '#181016',
  surfaceAlt: '#211720',
  border: '#30222D',
  borderDark: '#463543',

  success: '#22C55E',
  successLight: '#102A1A',
  warning: '#F5B84B',
  warningLight: '#30230F',
  error: '#FF5B66',
  errorLight: '#341319',
  info: '#70A7FF',
  infoLight: '#111C30',

  // Backward-compatible aliases
  brandBorder: '#57202B',
  ink2: '#D0C2BE',
  ink3: '#8F7F7C',
  ink4: '#4E3A55',
  bg: '#100A0D',
  amber: '#F5B84B',
  amberLight: '#30230F',
  teal: '#22C55E',
  tealLight: '#102A1A',
  midnightSurface: '#201426',
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
