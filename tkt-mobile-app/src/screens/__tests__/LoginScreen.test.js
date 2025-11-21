import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import LoginScreen from '../LoginScreen';

const mockStore = configureStore([]);

describe('LoginScreen', () => {
  let store;
  let component;

  beforeEach(() => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        isAuthenticated: false,
      },
    });

    component = (
      <Provider store={store}>
        <LoginScreen navigation={{ replace: jest.fn() }} />
      </Provider>
    );
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(component);

    expect(getByText('Welcome')).toBeTruthy();
    expect(getByPlaceholderText('Enter 10-digit mobile number')).toBeTruthy();
    expect(getByPlaceholderText('Enter 6-digit PIN')).toBeTruthy();
  });

  it('shows validation error for empty inputs', () => {
    const { getByText } = render(component);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);
    // Note: Alert.alert is hard to test directly without mocking,
    // but we can check if dispatch was NOT called
    expect(store.getActions()).toEqual([]);
  });
});
