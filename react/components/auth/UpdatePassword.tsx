import { useState } from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { FormControl } from '@/components/ui/form-control';
import { useAuth } from '@/contexts/authCtx';
import { useRouter } from 'expo-router';

export default function UpdatePassword() {
  const { updatePassword, isLoading, session } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user is authenticated (they should be after clicking the reset link)
  if (!session && !isLoading) {
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
          <Text
            size='2xl'
            bold
            style={{ textAlign: 'center', marginBottom: 16 }}
          >
            Invalid Reset Link
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 16 }}>
            This password reset link is invalid or has expired.
          </Text>
          <Button
            onPress={() => router.replace('/(auth)/login')}
            style={{ marginTop: 16 }}
          >
            <ButtonText>Go to Login</ButtonText>
          </Button>
        </VStack>
      </View>
    );
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    const { error: updateError } = await updatePassword(newPassword);

    if (updateError) {
      setError(updateError.message || 'Failed to update password');
    } else {
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
  };

  if (success) {
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
          <Text
            size='2xl'
            bold
            style={{ textAlign: 'center', marginBottom: 16 }}
          >
            Password Updated!
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 16 }}>
            Your password has been successfully updated.
          </Text>
          <Button
            onPress={() => router.replace('/(main)/profile')}
            style={{ marginTop: 16 }}
          >
            <ButtonText>Back to Profile</ButtonText>
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
          Set New Password
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>
          Enter your new password below.
        </Text>

        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>
            {error}
          </Text>
        ) : null}

        <FormControl>
          <Input>
            <InputField
              placeholder='New Password'
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize='none'
              autoComplete='password-new'
            />
          </Input>
        </FormControl>

        <FormControl>
          <Input>
            <InputField
              placeholder='Confirm New Password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize='none'
              autoComplete='password-new'
            />
          </Input>
        </FormControl>

        <Button
          onPress={handleUpdatePassword}
          disabled={isLoading}
          style={{ marginTop: 16 }}
        >
          <ButtonText>
            {isLoading ? 'Updating...' : 'Update Password'}
          </ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
