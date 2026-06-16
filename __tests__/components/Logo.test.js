import React from 'react';
import { render } from '@testing-library/react-native';
import Logo from '../../components/Logo';
import CategoriaIcone from '../../components/CategoriaIcone';

describe('Logo', () => {
  it('renderiza a variante full com o wordmark "Foome" sem provider', () => {
    // Sem ThemeProvider: usa o valor padrão do contexto (não deve quebrar).
    const { getByText } = render(<Logo />);
    expect(getByText('Foome')).toBeTruthy();
  });

  it('renderiza a variante symbol (só SVG)', () => {
    const { queryByText } = render(<Logo variant="symbol" />);
    expect(queryByText('Foome')).toBeNull();
  });
});

describe('CategoriaIcone', () => {
  it('renderiza sem quebrar para uma categoria conhecida e desconhecida', () => {
    expect(() => render(<CategoriaIcone categoria="Pizzas" />)).not.toThrow();
    expect(() => render(<CategoriaIcone categoria="Inexistente" />)).not.toThrow();
  });
});
