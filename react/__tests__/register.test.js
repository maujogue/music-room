import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Register from '../app/(auth)/register';
import { useAuth } from '../contexts/authCtx';
import { useRouter } from 'expo-router';

// Dependencies mock
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../contexts/authCtx', () => ({
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
        accessibilityRole="button"
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
  InputField: (props) => {
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

describe('Register Component', () => {
  let mockSignUp;
  let mockRouterPush;
  let mockRouterReplace;

  beforeEach(() => {
    // Mocks reset
    mockSignUp = jest.fn();
    mockRouterPush = jest.fn();
    mockRouterReplace = jest.fn();

    useRouter.mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
    });

    useAuth.mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<Register />);

    expect(getByText('Register')).toBeTruthy();
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Already have an account? Login')).toBeTruthy();
  });

  it('updates input fields when user types', () => {
    const { getByPlaceholderText } = render(<Register />);

    const usernameInput = getByPlaceholderText('Username');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(usernameInput.props.value).toBe('testuser');
    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('shows error when fields are empty', async () => {
    const { getByText } = render(<Register />);

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(getByText('Please enter all fields')).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUp function with correct parameters when form is submitted', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<Register />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message when signUp fails', async () => {
    const errorMessage = 'Email already exists';
    mockSignUp.mockResolvedValue({ error: { message: errorMessage } });

    const { getByPlaceholderText, getByText, findByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    const errorElement = await findByText(errorMessage);
    expect(errorElement).toBeTruthy();
  });

  it('redirects to main page on successful sign up', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/(main)');
    });
  });

  it('displays error message on sign up failure for email already exists', async () => {
    const errorMessage = 'Email already exists';
    mockSignUp.mockResolvedValue({ error: { message: errorMessage } });

    const { getByPlaceholderText, getByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('displays error message on sign up failure for username already exists', async () => {
    const errorMessage = 'Username already exists';
    mockSignUp.mockResolvedValue({ error: { message: errorMessage } });

    const { getByPlaceholderText, getByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('shows loading state when signing up', () => {
    useAuth.mockReturnValue({
      signUp: mockSignUp,
      isLoading: true,
    });

    const { getByText } = render(<Register />);

    expect(getByText('Signing Up...')).toBeTruthy();
  });

  it('disables button when loading', () => {
    useAuth.mockReturnValue({
      signUp: mockSignUp,
      isLoading: true,
    });

    const { getByText, UNSAFE_getByType } = render(<Register />);

    expect(getByText('Signing Up...')).toBeTruthy();

    const signUpButton = getByText('Signing Up...').parent.parent;
    fireEvent.press(signUpButton);

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('navigates to login page when login button is pressed', () => {
    const { getByText } = render(<Register />);

    const loginButton = getByText('Already have an account? Login');
    fireEvent.press(loginButton);

    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  it('limits username to 20 characters', () => {
    const { getByPlaceholderText } = render(<Register />);

    const usernameInput = getByPlaceholderText('Username');
    expect(usernameInput.props.maxLength).toBe(20);
  });

  it('sets email input to email keyboard type', () => {
    const { getByPlaceholderText } = render(<Register />);

    const emailInput = getByPlaceholderText('Email');
    expect(emailInput.props.keyboardType).toBe('email-address');
    expect(emailInput.props.autoCapitalize).toBe('none');
  });

  it('sets password input as secure text entry', () => {
    const { getByPlaceholderText } = render(<Register />);

    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('sign up button renders correctly', () => {
    render(<Register />);

    const button = screen.getByText('Sign Up');
    expect(button).toBeTruthy();
  });

  it('displays login button', () => {
    render(<Register />);

    const loginButton = screen.getByText('Already have an account? Login');
    expect(loginButton).toBeTruthy();
  });

  it('renders exactly 2 buttons', async () => {
    render(<Register />);

    const buttons = await screen.findAllByRole('button');

    expect(buttons).toHaveLength(2);
  })

  it('renders the title "Register"', async () => {
    render(<Register />);

    const title = await screen.findByText('Register');

    expect(title).toBeTruthy();
  });
  it('renders username input with correct placeholder', async () => {
    render(<Register />);

    const usernameInput = await screen.findByPlaceholderText('Username');

    expect(usernameInput).toBeTruthy();
  });

  it('renders email input with correct placeholder', async () => {
    render(<Register />);

    const emailInput = await screen.findByPlaceholderText('Email');

    expect(emailInput).toBeTruthy();
  });

  it('renders password input with correct placeholder', async () => {
    render(<Register />);

    const passwordInput = await screen.findByPlaceholderText('Password');

    expect(passwordInput).toBeTruthy();
  });

  it('renders helper text for username', async () => {
    render(<Register />);

    const helperText = await screen.findByText(
      'Username must be between 3 and 20 characters'
    );

    expect(helperText).toBeTruthy();
  });

  it('renders Sign Up button with correct text', async () => {
    render(<Register />);

    const signUpButton = await screen.findByText('Sign Up');

    expect(signUpButton).toBeTruthy();
  });

  it('renders login redirect button with correct text', async () => {
    render(<Register />);

    const loginButton = await screen.findByText('Already have an account? Login');

    expect(loginButton).toBeTruthy();
  });

  it('does not render error message initially', () => {
    render(<Register />);

    const errorMessages = screen.queryAllByText(/Please enter all fields/i);

    expect(errorMessages).toHaveLength(0);
  });

});
