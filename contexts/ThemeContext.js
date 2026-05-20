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
  brand: '#E8452C',
  brandDark: '#C23525',
  brandLight: '#2A1513',
  brandBorder: '#4A2020',

  ink: '#F0F0F7',
  ink2: '#C8C8DC',
  ink3: '#9494B2',
  ink4: '#6A6A82',

  bg: '#12121A',
  surface: '#1E1E2A',
  border: '#2A2A3A',

  amber: '#FF9B3D',
  amberLight: '#2A2018',
  teal: '#00BE99',
  tealLight: '#182A24',
};

const ThemeContext = createContext(null);

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
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
