import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../auth/LoginScreen';
import { loginUser } from '../../services/authService';

jest.mock('../../services/authService', () => ({
  loginUser: jest.fn(),
}));

describe('LoginScreen Integration Test', () => {
  
  it('harus memanggil fungsi login saat tombol ditekan', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('harus menampilkan pesan error jika form kosong', () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText('Login'));

    expect(getByText('Harap isi email dan kata sandi.')).toBeTruthy();
  });

});