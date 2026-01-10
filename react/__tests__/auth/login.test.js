import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import SignIn from '../../app/(auth)/login';
import { useAuth } from '../../contexts/authCtx';
import { useRouter } from 'expo-router';

// Dependencies mock
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../contexts/authCtx', () => ({
  useAuth: jest.fn(),
}));

// UI components mock
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onPress, disabled, testID, ...props }) => {
    const MockButton = require('react-native').TouchableOpacity;
    return (
      <MockButton
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole='button'
        {...props}
      >
        {children}
      </MockButton>
    );
  },
  ButtonText: ({ children }) => {
    const MockText = require('react-native').Text;
    return <MockText>{children}</MockText>;
  },
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ children }) => {
    const MockView = require('react-native').View;
    return <MockView>{children}</MockView>;
  },
  InputField: props => {
    const MockTextInput = require('react-native').TextInput;
    return <MockTextInput {...props} />;
  },
}));

jest.mock('@/components/ui/vstack', () => ({
  VStack: ({ children, style }) => {
    const MockView = require('react-native').View;
    return <MockView style={style}>{children}</MockView>;
  },
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, style }) => {
    const MockText = require('react-native').Text;
    return <MockText style={style}>{children}</MockText>;
  },
}));

jest.mock('@/components/ui/form-control', () => ({
  FormControl: ({ children }) => {
    const MockView = require('react-native').View;
    return <MockView>{children}</MockView>;
  },
  FormControlHelperText: ({ children }) => {
    const MockText = require('react-native').Text;
    return <MockText>{children}</MockText>;
  },
}));

describe('SignIn Component', () => {
  let mockSignIn;
  let mockSignInWithGoogle;
  let mockSignInWithSpotify;
  let mockRouterPush;
  let mockRouterReplace;

  beforeEach(() => {
    // Mocks reset
    mockSignIn = jest.fn();
    mockSignInWithGoogle = jest.fn();
    mockSignInWithSpotify = jest.fn();
    mockRouterPush = jest.fn();
    mockRouterReplace = jest.fn();

    useRouter.mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
    });

    useAuth.mockReturnValue({
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithSpotify: mockSignInWithSpotify,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly the sign in form', () => {
    const { getByRole, getByPlaceholderText, getAllByText, getByText } = render(
      <SignIn />
    );

    const textElement = getAllByText('Sign In')[0];

    expect(textElement).toBeTruthy();
    expect(textElement.tagName).not.toBe('BUTTON');
    expect(getByRole('button', { name: 'Sign In' })).toBeTruthy();

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText("Don't have an account? Register")).toBeTruthy();
    expect(getByText('Forgot Password?')).toBeTruthy();
  });

  it('calls signIn function with correct parameters when form is submitted', async () => {
    mockSignIn.mockResolvedValue({ error: null });

    render(<SignIn />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message when password is empty', async () => {
    render(<SignIn />);

    const emailInput = screen.getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'test@example.com');

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please enter both email and password')
      ).toBeTruthy();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('renders exactly 5 buttons', async () => {
    render(<SignIn />);

    const buttons = await screen.findAllByRole('button');

    expect(buttons).toHaveLength(5);
  });

  it('sets password input as secure text entry', () => {
    const { getByPlaceholderText } = render(<SignIn />);

    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('sign up button renders correctly', () => {
    render(<SignIn />);

    const button = screen.getByRole('button', { name: 'Sign In' });
    expect(button).toBeTruthy();
  });

  it('displays register button', () => {
    render(<SignIn />);

    const loginButton = screen.getByText("Don't have an account? Register");
    expect(loginButton).toBeTruthy();
  });

  it('navigates to register page when register button is pressed', () => {
    const { getByText } = render(<SignIn />);

    const loginButton = getByText("Don't have an account? Register");
    fireEvent.press(loginButton);

    expect(mockRouterPush).toHaveBeenCalledWith('/register');
  });

  it('displays forgot password button', () => {
    render(<SignIn />);

    const loginButton = screen.getByText('Forgot Password?');
    expect(loginButton).toBeTruthy();
  });

  it('navigates to forgotten password page when forgot password button is pressed', () => {
    const { getByText } = render(<SignIn />);

    const loginButton = getByText('Forgot Password?');
    fireEvent.press(loginButton);

    expect(mockRouterPush).toHaveBeenCalledWith('/forgotten_password');
  });

  it('displays error message when signIn returns an error', async () => {
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    render(<SignIn />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('calls signInWithGoogle and navigates on success', async () => {
    mockSignInWithGoogle.mockResolvedValue({ success: true, data: {} });

    render(<SignIn />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign in with Google' }));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(main)');
    });
  });

  it('displays error message when signInWithGoogle fails', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: false,
      error: { message: 'Google login cancelled' },
    });

    render(<SignIn />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign in with Google' }));

    await waitFor(() => {
      expect(screen.getByText('Google login cancelled')).toBeTruthy();
    });
  });

  it('calls signInWithSpotify and navigates on success', async () => {
    mockSignInWithSpotify.mockResolvedValue({ success: true, data: {} });

    render(<SignIn />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign in with Spotify' }));

    await waitFor(() => {
      expect(mockSignInWithSpotify).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(main)');
    });
  });

  it('displays error message when signInWithSpotify fails', async () => {
    mockSignInWithSpotify.mockResolvedValue({
      success: false,
      error: { message: 'Spotify login failed' },
    });

    render(<SignIn />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign in with Spotify' }));

    await waitFor(() => {
      expect(screen.getByText('Spotify login failed')).toBeTruthy();
    });
  });

  it('displays default error message when signInWithGoogle fails without message', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: false,
      error: {},
    });

    render(<SignIn />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign in with Google' }));

    await waitFor(() => {
      expect(
        screen.getByText('Google Sign-In failed. Please try again.')
      ).toBeTruthy();
    });
  });

  it('displays default error message when signInWithSpotify fails without message', async () => {
    mockSignInWithSpotify.mockResolvedValue({
      success: false,
      error: {},
    });

    render(<SignIn />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign in with Spotify' }));

    await waitFor(() => {
      expect(
        screen.getByText('Spotify Sign-In failed. Please try again.')
      ).toBeTruthy();
    });
  });

  it('renders "Signing In..." when isLoading is true', () => {
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithSpotify: mockSignInWithSpotify,
      isLoading: true,
    });

    render(<SignIn />);

    expect(screen.getByText('Signing In...')).toBeTruthy();
  });
});
