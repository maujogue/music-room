import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';
import { Image } from '@/components/ui/image';
import { HStack } from '@/components/ui/hstack';

import { useAuth } from '../../contexts/authCtx';

export default function SignIn() {
  const { signIn, signInWithGoogle, signInWithSpotify, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    setError('');

    const result = await signInWithGoogle();

    if (result.success) {
      console.log('Google Sign-In successful:', result.data);
      router.replace('/(main)');
    } else {
      setError(
        result.error?.message || 'Google Sign-In failed. Please try again.'
      );
    }
  };

  const handleSpotifySignIn = async () => {
    setError('');

    const result = await signInWithSpotify();

    if (result.success) {
      console.log('Spotify Sign-In successful:', result.data);
      router.replace('/(main)');
    } else {
      setError(
        result.error?.message || 'Spotify Sign-In failed. Please try again.'
      );
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
        <Button
          variant='solid'
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          style={{ backgroundColor: '#4285F4' }}
          className='bg-[#4285F4] data-[hover=true]:bg-[#357ae8] data-[active=true]:bg-[#3367d6]'
        >
          <HStack className='items-center gap-2'>
            <Image
              source={{
                uri: 'https://www.google.com/favicon.ico',
              }}
              className='w-5 h-5'
              alt='Google logo'
              resizeMode='contain'
            />
            <ButtonText className='text-white'>Sign in with Google</ButtonText>
          </HStack>
        </Button>
        <Button
          variant='solid'
          onPress={handleSpotifySignIn}
          disabled={isLoading}
          style={{ marginTop: 8, backgroundColor: '#1DB954' }}
          className='bg-[#1DB954] data-[hover=true]:bg-[#1ed760] data-[active=true]:bg-[#1aa34a]'
        >
          <HStack className='items-center gap-2'>
            <Image
              source={{
                uri: 'https://spotify.com/favicon.ico',
              }}
              className='w-5 h-5'
              alt='Spotify logo'
              resizeMode='contain'
            />
            <ButtonText className='text-white'>Sign in with Spotify</ButtonText>
          </HStack>
        </Button>
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
