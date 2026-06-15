import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render, fireEvent } from '../../test-utils';
import PrimaryButton from '../../components/PrimaryButton';

describe('PrimaryButton', () => {
  it('renderiza label corretamente', () => {
    const { getByText } = render(<PrimaryButton label="Entrar" onPress={jest.fn()} />);

    expect(getByText('Entrar')).toBeTruthy();
  });

  it('dispara onPress ao tocar', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton label="Entrar" onPress={onPress} />);

    fireEvent.press(getByText('Entrar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não dispara onPress quando disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton label="Entrar" onPress={onPress} disabled />);

    fireEvent.press(getByText('Entrar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('não dispara onPress quando loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton label="Entrar" onPress={onPress} loading />);

    fireEvent.press(getByText('Aguarde...'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('usa cor customizada quando fornecida', () => {
    const { UNSAFE_getByType } = render(
      <PrimaryButton label="Teste" onPress={jest.fn()} color="#00BE99" />,
    );

    const touchable = UNSAFE_getByType(TouchableOpacity);

    expect(touchable.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#00BE99' })]),
    );
  });
});
