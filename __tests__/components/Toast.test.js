import React from 'react';
import { render } from '@testing-library/react-native';
import Toast from '../../components/Toast';

describe('Toast', () => {
  it('não renderiza quando visivel=false', () => {
    const { toJSON } = render(
      <Toast visivel={false} mensagem="Teste" tipo="info" onClose={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('renderiza mensagem de sucesso', () => {
    const { getByText } = render(
      <Toast visivel mensagem="Deu certo!" tipo="sucesso" onClose={jest.fn()} />,
    );

    expect(getByText('Deu certo!')).toBeTruthy();
  });

  it('renderiza mensagem de erro', () => {
    const { getByText } = render(
      <Toast visivel mensagem="Algo deu errado" tipo="erro" onClose={jest.fn()} />,
    );

    expect(getByText('Algo deu errado')).toBeTruthy();
  });

  it('renderiza mensagem de info', () => {
    const { getByText } = render(
      <Toast visivel mensagem="Informacao" tipo="info" onClose={jest.fn()} />,
    );

    expect(getByText('Informacao')).toBeTruthy();
  });
});
