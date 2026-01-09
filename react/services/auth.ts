import { Linking } from 'react-native';
import { apiFetch } from '@/utils/apiFetch';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Google Sign-In configuration
const GOOGLE_CONFIG = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

// Initialize Google Sign-In configuration
export function configureGoogleSignIn() {
  GoogleSignin.configure(GOOGLE_CONFIG);
}

// Google Sign-In error types
export interface GoogleSignInError {
  code: string;
  message: string;
}

// Google Sign-In result
export interface GoogleSignInResult {
  success: boolean;
  data?: any;
  error?: GoogleSignInError;
}

// Spotify Sign-In error types
export interface SpotifySignInError {
  code: string;
  message: string;
}

// Spotify Sign-In result
export interface SpotifySignInResult {
  success: boolean;
  data?: any;
  error?: SpotifySignInError;
}

// Handle Google Sign-In flow
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices();

    // Get the user info and ID token
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data || !userInfo.data.idToken) {
      return {
        success: false,
        error: {
          code: 'NO_ID_TOKEN',
          message: 'No ID token present!',
        },
      };
    }

    // Use the ID token to sign in with Supabase
    const { data, error: googleSignInError } =
      await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

    if (googleSignInError) {
      return {
        success: false,
        error: {
          code: 'SUPABASE_ERROR',
          message: googleSignInError.message,
        },
      };
    }
    console.log('Google Sign-In successful:', userInfo.data);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.log('Google Sign-In Error:', error);

    let errorMessage = 'Google Sign-In failed. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // User cancelled the login flow
      console.log('User cancelled Google Sign-In');
      errorCode = 'CANCELLED';
      errorMessage = 'Sign-in was cancelled';
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // Operation (e.g. sign in) is in progress already
      console.log('Google Sign-In already in progress');
      errorCode = 'IN_PROGRESS';
      errorMessage = 'Sign-in already in progress';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // Play services not available or outdated
      errorCode = 'PLAY_SERVICES_NOT_AVAILABLE';
      errorMessage =
        'Google Play Services not available. Please update your Google Play Services.';
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    };
  }
}

// Sign out from Google
export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.log('Error signing out from Google:', error);
  }
}

// Check if user is signed in with Google
export async function isSignedInWithGoogle(): Promise<boolean> {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser !== null;
  } catch (error) {
    console.log('Error checking Google sign-in status:', error);
    return false;
  }
}

// Handle Spotify Sign-In flow
export async function signInWithSpotify(): Promise<SpotifySignInResult> {
  try {
    // Get the Spotify authorization URL (using existing endpoint)
    const response = await apiFetch<{ url: string }>(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/auth/spotify`,
      {
        method: 'POST',
      }
    );

    if (!response.success) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message:
            response.error?.message ||
            'Failed to get Spotify authorization URL',
        },
      };
    }

    // Open the Spotify authorization URL
    await Linking.openURL(response.data.url);

    // Note: The actual authentication happens in the callback
    // This function just initiates the flow
    return {
      success: true,
      data: { message: 'Spotify authorization initiated' },
    };
  } catch (error: any) {
    console.log('Spotify Sign-In Error:', error);

    let errorMessage = 'Spotify Sign-In failed. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.message?.includes('cancelled')) {
      errorCode = 'CANCELLED';
      errorMessage = 'Sign-in was cancelled';
    } else if (error.message?.includes('network')) {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Network error. Please check your connection.';
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    };
  }
}
