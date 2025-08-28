import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';

import { useAuth } from '../../contexts/authCtx';

export default function SignIn() {
  const { signIn, isLoading } = useAuth();
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
