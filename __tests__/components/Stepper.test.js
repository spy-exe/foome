import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Stepper from '../../components/Stepper';

describe('Stepper', () => {
  it('renderiza botão de adicionar quando quantidade é 0', () => {
    const onAdd = jest.fn();
    const { UNSAFE_getByType } = render(
      <Stepper quantidade={0} cor="#E8452C" onAdicionar={onAdd} onRemover={jest.fn()} />,
    );

    expect(UNSAFE_getByType(TouchableOpacity)).toBeTruthy();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('mostra controles quando quantidade é maior que 0', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <Stepper quantidade={3} cor="#E8452C" onAdicionar={jest.fn()} onRemover={jest.fn()} />,
    );

    expect(getByText('3')).toBeTruthy();
    expect(UNSAFE_getAllByType(TouchableOpacity)).toHaveLength(2);
  });

  it('dispara onAdicionar ao tocar no botão de adicionar no estado zero', () => {
    const onAdd = jest.fn();
    const { UNSAFE_getByType } = render(
      <Stepper quantidade={0} cor="#E8452C" onAdicionar={onAdd} onRemover={jest.fn()} />,
    );

    fireEvent.press(UNSAFE_getByType(TouchableOpacity));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('dispara onAdicionar ao tocar no botão de adicionar com quantidade maior que 0', () => {
    const onAdd = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Stepper quantidade={2} cor="#E8452C" onAdicionar={onAdd} onRemover={jest.fn()} />,
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[1]);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('dispara onRemover ao tocar no botão de remover', () => {
    const onRemove = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Stepper quantidade={2} cor="#E8452C" onAdicionar={jest.fn()} onRemover={onRemove} />,
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
