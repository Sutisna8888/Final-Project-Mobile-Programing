import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScaleButton from '../ScaleButton';
import { Text } from 'react-native';

describe('ScaleButton Component', () => {
  
  it('harus merender children (teks) dengan benar', () => {
    const { getByText } = render(
      <ScaleButton onPress={() => {}}>
        <Text>Tombol Tes</Text>
      </ScaleButton>
    );
    expect(getByText('Tombol Tes')).toBeTruthy();
  });

  it('harus memanggil fungsi onPress saat ditekan', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ScaleButton onPress={mockOnPress}>
        <Text>Klik Saya</Text>
      </ScaleButton>
    );

    fireEvent.press(getByText('Klik Saya'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

});