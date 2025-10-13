import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import SignIn from '../app/(auth)/login';
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

describe('SignIn Component', () => {
	let mockSignIn;
	let mockRouterPush;
	let mockRouterReplace;

	beforeEach(() => {
		// Mocks reset
		mockSignIn = jest.fn();
		mockRouterPush = jest.fn();
		mockRouterReplace = jest.fn();

		useRouter.mockReturnValue({
			push: mockRouterPush,
			replace: mockRouterReplace,
		});

		useAuth.mockReturnValue({
			signIn: mockSignIn,
			isLoading: false,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('renders correctly the sign in form', () => {
		const { getByRole, getByPlaceholderText, getAllByText, getByText } = render(<SignIn />);

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
		const signInButton = screen.getByRole('button', { name: 'Sign In' })

		fireEvent.changeText(emailInput, 'test@example.com');
		fireEvent.changeText(passwordInput, 'password123');

		fireEvent.press(signInButton);

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
			expect(mockSignIn).toHaveBeenCalledTimes(1);
		});
	});

	it('displays error message when password is empty', async () => {
		render(<SignIn />);

		const emailInput = screen.getByPlaceholderText('Email');

		fireEvent.changeText(emailInput, 'test@example.com');

		const signInButton = screen.getByRole('button', { name: 'Sign In' })
		fireEvent.press(signInButton);

		await waitFor(() => {
			expect(screen.getByText('Please enter both email and password')).toBeTruthy();
		});

		expect(mockSignIn).not.toHaveBeenCalled();
	});

	it('renders exactly 3 buttons', async () => {
		render(<SignIn />);

		const buttons = await screen.findAllByRole('button');

		expect(buttons).toHaveLength(3);
	})

	it('sets password input as secure text entry', () => {
		const { getByPlaceholderText } = render(<SignIn />);

		const passwordInput = getByPlaceholderText('Password');
		expect(passwordInput.props.secureTextEntry).toBe(true);
	});

	it('sign up button renders correctly', () => {
		render(<SignIn />);

		const button = screen.getByRole('button', { name: 'Sign In' })
		expect(button).toBeTruthy();
	});

	it('displays register button', () => {
		render(<SignIn />);

		const loginButton = screen.getByText('Don\'t have an account? Register');
		expect(loginButton).toBeTruthy();
	});

	it('navigates to register page when register button is pressed', () => {
		const { getByText } = render(<SignIn />);

		const loginButton = getByText('Don\'t have an account? Register');
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

});
