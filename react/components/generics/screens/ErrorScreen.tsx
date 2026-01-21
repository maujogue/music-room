import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { AlertCircle } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

interface Props {
  error: string | null;
  text?: string;
  actionButton?: React.ReactNode;
}

export default function ErrorScreen({
  error,
  text = 'Please try again later.',
  actionButton,
}: Props) {
  const { signOut } = useAuth();
  const { connectSpotify } = useProfile();
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);

  const parsedError = useMemo(() => {
    if (!error) {
      return {
        message: 'Something went wrong',
        isSpotifyIssue: false,
      };
    }

    let message = error;
    let status: number | undefined;

    try {
      const parsed = JSON.parse(error) as { message?: string; status?: number };
      if (parsed?.message) {
        message = parsed.message;
      }
      if (typeof parsed?.status === 'number') {
        status = parsed.status;
      }
    } catch {
      // keep raw error string
    }

    const isSpotifyIssue =
      /spotify/i.test(message) || (status === 401 && /connect/i.test(message));

    return { message, isSpotifyIssue };
  }, [error]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleConnectSpotify = async () => {
    if (isConnectingSpotify) return;
    setIsConnectingSpotify(true);
    try {
      await connectSpotify();
    } finally {
      setIsConnectingSpotify(false);
    }
  };

  return (
    <Center className='flex-1 p-6'>
      <View className='bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm'>
        <VStack className='items-center gap-4'>
          {/* Icon */}
          <View className='bg-red-100 rounded-full p-4'>
            <AlertCircle size={40} color='#dc2626' />
          </View>

          {/* Title */}
          <Text className='text-xl font-bold text-gray-900 text-center'>
            Oops!
          </Text>

          {/* Error message */}
          <Text className='text-base text-gray-700 text-center'>
            {parsedError.message}
          </Text>

          {/* Subtitle */}
          <Text className='text-sm text-gray-500 text-center'>{text}</Text>

          {/* Buttons */}
          <VStack className='w-full gap-3 mt-4'>
            {parsedError.isSpotifyIssue && (
              <Button
                className='w-full rounded-full h-12 bg-green-500'
                onPress={handleConnectSpotify}
                disabled={isConnectingSpotify}
              >
                <ButtonText className='font-semibold text-white'>
                  {isConnectingSpotify
                    ? 'Connecting...'
                    : 'Connect your Spotify'}
                </ButtonText>
              </Button>
            )}

            {actionButton}

            <Button
              variant='outline'
              className='w-full rounded-full h-12 border-gray-300'
              onPress={handleLogout}
            >
              <ButtonText className='text-red-600 font-semibold'>
                Logout
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </View>
    </Center>
  );
}
