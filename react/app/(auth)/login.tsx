import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';

import { useSession } from '../../contexts/authCtx';

export default function SignIn() {
  const { signIn } = useSession();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        onPress={() => {
          signIn();
          router.replace('/(main)');
        }}
        style={{ marginBottom: 16 }}
      >
        <ButtonText>Sign In</ButtonText>
      </Button>

      <Button
        variant='outline'
        onPress={() => router.push('/register')}
        style={{ marginBottom: 16 }}
      >
        <ButtonText>Don't have an account? Register</ButtonText>
      </Button>

      <Button variant='link' onPress={() => router.push('/forgotten_password')}>
        <ButtonText>Forgot Password?</ButtonText>
      </Button>
    </View>
  );
}
