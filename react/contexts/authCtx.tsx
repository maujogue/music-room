import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  type PropsWithChildren,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import {
  configureGoogleSignIn,
  signInWithGoogle as googleSignInService,
  signInWithSpotify as spotifySignInService,
  signOutFromGoogle,
  type GoogleSignInResult,
  type SpotifySignInResult,
} from '../services/auth';
import { useRouter } from 'expo-router';

type Tokens = {
  access_token: string;
  refresh_token: string;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  signInWithSpotify: () => Promise<SpotifySignInResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  loginWithToken: (tokens: Tokens) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context: AuthContextType | undefined = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to parse Supabase URLs (converts # to ?)
// Supabase uses hash fragments (#) instead of query params (?) for tokens in React Native
const parseSupabaseUrl = (url: string): string => {
  let parsedUrl = url;
  if (url.includes('#')) {
    parsedUrl = url.replace('#', '?');
  }
  return parsedUrl;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Token-based login function (from Theodo blog post)
  const loginWithToken = useCallback(
    async ({ access_token, refresh_token }: Tokens) => {
      const signIn = async () => {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        return await supabase.auth.refreshSession();
      };

      const {
        data: { user: supabaseUser },
        error,
      } = await signIn();

      if (error) {
        console.error('Error logging in with token:', error);
        return;
      }

      setUser(supabaseUser);
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();
      setSession(newSession);
    },
    []
  );

  useEffect(() => {
    // Configure Google Sign-In
    configureGoogleSignIn();

    // Helper to extract tokens from URL
    const extractTokensFromUrl = (url: string): Tokens | null => {
      const transformedUrl = parseSupabaseUrl(url);
      const parsedUrl = Linking.parse(transformedUrl);

      const access_token = parsedUrl.queryParams?.access_token;
      const refresh_token = parsedUrl.queryParams?.refresh_token;

      if (
        typeof access_token === 'string' &&
        typeof refresh_token === 'string'
      ) {
        return { access_token, refresh_token };
      }

      return null;
    };

    const handleDeepLink = async (url: string) => {
      // Only process update-password links
      if (!url.includes('update-password')) {
        return;
      }

      const tokens = extractTokensFromUrl(url);
      if (tokens) {
        await loginWithToken(tokens);
      }
    };

    // Check initial URL when app opens (cold start)
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleDeepLink(initialUrl);
      }
    };

    checkInitialUrl();

    // Listen for URL changes (when app is already running)
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      await handleDeepLink(url);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, [loginWithToken]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return { error };
  };

  const signUp = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: 'music-room://',
      },
    });
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    const router = useRouter();
    setIsLoading(true);
    await signOutFromGoogle();
    await supabase.auth.signOut();
    router.navigate('/(auth)/login');
    setIsLoading(false);
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    setIsLoading(true);
    const result = await googleSignInService();
    setIsLoading(false);
    return result;
  };

  const signInWithSpotify = async (): Promise<SpotifySignInResult> => {
    setIsLoading(true);
    const result = await spotifySignInService();
    setIsLoading(false);
    return result;
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    // Use Linking.createURL to generate proper deep link (from Theodo blog post)
    const resetPasswordURL = Linking.createURL('/update-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetPasswordURL,
    });
    setIsLoading(false);
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsLoading(false);

    if (!error && data) {
      console.log('Password updated successfully');
    }

    return { error };
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithSpotify,
    signOut,
    resetPassword,
    updatePassword,
    loginWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
