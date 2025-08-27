import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';

import { useAuth } from '../../contexts/authCtx';

export default function Register() {
  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      setError('Please enter all fields');
      return;
    }

    const { error: signUpError } = await signUp(username, email, password);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      console.log('signUp success');
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
          Register
        </Text>

        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>
            {error}
          </Text>
        ) : null}
        <FormControl>
          <Input>
            <InputField
              placeholder='Username'
              value={username}
              onChangeText={setUsername}
              secureTextEntry
            />
          </Input>
        </FormControl>
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
          onPress={handleSignUp}
          disabled={isLoading}
          style={{ marginTop: 16 }}
        >
          <ButtonText>{isLoading ? 'Signing Up...' : 'Sign Up'}</ButtonText>
        </Button>

        <Button
          variant='outline'
          onPress={() => router.push('/login')}
          style={{ marginTop: 8 }}
        >
          <ButtonText>Already have an account? Login</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
