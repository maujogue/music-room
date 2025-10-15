import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { useAuth } from '../../contexts/authCtx';

export default function SignIn() {
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] =
    useState(false);

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '672488124519-goc32u81109lslod22kkbltk83qo3303.apps.googleusercontent.com',
      iosClientId:
      '672488124519-1evo7am5jdfsga8utom0q2ittcfd0npn.apps.googleusercontent.com',
    });
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
    } else {
      console.log('signIn success');
      router.replace('/(main)');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSignInInProgress(true);
      setError('');

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Get the user info and ID token
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data.idToken) {
        // Use the ID token to sign in with Supabase
        const { data, error: googleSignInError } = await signInWithGoogle(
          userInfo.data.idToken
        );

        if (googleSignInError) {
          setError(googleSignInError.message);
        } else {
          console.log('Google Sign-In successful:', data);
          router.replace('/(main)');
        }
      } else {
        throw new Error('No ID token present!');
      }
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        console.log('User cancelled Google Sign-In');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign in) is in progress already
        console.log('Google Sign-In already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services not available or outdated
        setError(
          'Google Play Services not available. Please update your Google Play Services.'
        );
      } else {
        // Some other error happened
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsGoogleSignInInProgress(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <VStack space='md' style={{ width: '100%', maxWidth: 400 }}>
        <Text size='2xl' bold style={{ textAlign: 'center', marginBottom: 16 }}>
          Sign In
        </Text>
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>
            {error}
          </Text>
        ) : null}
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
          disabled={isGoogleSignInInProgress || isLoading}
        />
        <FormControl>
          <Input>
            <InputField
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
            />
          </Input>
        </FormControl>
        <FormControl>
          <Input>
            <InputField
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Input>
        </FormControl>
        <Button
          onPress={handleSignIn}
          disabled={isLoading}
          style={{ marginTop: 16 }}
        >
          <ButtonText>{isLoading ? 'Signing In...' : 'Sign In'}</ButtonText>
        </Button>
        <Button
          variant='outline'
          onPress={() => router.push('/register')}
          style={{ marginTop: 8 }}
        >
          <ButtonText>Don't have an account? Register</ButtonText>
        </Button>
        <Button
          variant='link'
          onPress={() => router.push('/forgotten_password')}
        >
          <ButtonText>Forgot Password?</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
