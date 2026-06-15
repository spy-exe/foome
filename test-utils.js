import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from './contexts/ThemeContext';

// Wrapper padrão dos testes: componentes agora consomem o tema via useTheme(),
// então precisam estar dentro do ThemeProvider (igual ao app real).
function Wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

const customRender = (ui, options) => render(ui, { wrapper: Wrapper, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
