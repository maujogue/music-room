import { useState } from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';
import { useAuth } from '@/contexts/authCtx';
import { useRouter } from 'expo-router';

export default function ForgottenPassword() {
  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email');
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
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
            Check Your Email
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 16 }}>
            We've sent a password reset link to {email}
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 16, fontSize: 12, color: '#666' }}>
            Click the link in the email to reset your password.
          </Text>
          <Button onPress={() => router.back()} style={{ marginTop: 16 }}>
            <ButtonText>Back to Login</ButtonText>
          </Button>
        </VStack>
      </View>
    );
  }

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
          Reset Password
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>
          Enter your email address and we'll send you a link to reset your password.
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
              autoComplete='email'
            />
          </Input>
        </FormControl>

        <Button
          onPress={handleResetPassword}
          disabled={isLoading}
          style={{ marginTop: 16 }}
        >
          <ButtonText>{isLoading ? 'Sending...' : 'Send Reset Link'}</ButtonText>
        </Button>

        <Button variant='link' onPress={() => router.back()} style={{ marginTop: 8 }}>
          <ButtonText>Back to Login</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
