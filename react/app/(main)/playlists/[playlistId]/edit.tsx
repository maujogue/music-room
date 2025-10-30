import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePlaylist } from '@/hooks/usePlaylist';
import EditPlaylistForm from '@/components/playlist/EditPlaylistForm';
import { Center } from '@/components/ui/center';
import { ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { editPlaylistById } from '@/services/playlist';
import { useSubscription } from '@/contexts/subscriptionCtx';
import PaywallModal from '@/components/subscription/PaywallModal';

export default function EditPlaylist() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState(false);
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();

  const { playlist, loading, error: fetchError } = usePlaylist(playlistId);
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();

  const onSubmit = async (payload: PlaylistPayload) => {
    await editPlaylistById(playlistId, payload)
      .then(() => {
        router.push(`(main)/playlists/${playlistId}`);
      })
      .catch(err => {
        console.error('Error editing playlist:', err);
        setError('Failed to edit playlist. Please try again.');
      });
  };

  if (loading || subscriptionLoading) {
    return (
      <Center>
        <ActivityIndicator size='large' />
      </Center>
    );
  }

  if (fetchError) {
    return (
      <Center>
        <Text style={{ color: 'red' }}>{fetchError}</Text>
      </Center>
    );
  }

  if (!playlist) {
    return (
      <Center>
        <Text>Playlist not found</Text>
      </Center>
    );
  }

  // Show paywall for non-premium users
  if (!isPremium) {
    return (
      <>
        <Center className="flex-1 p-6">
          <Text className="text-xl font-bold text-center mb-4">
            Premium Feature
          </Text>
          <Text className="text-typography-600 text-center mb-6">
            You need a premium subscription to edit playlists. Upgrade to unlock this feature and more!
          </Text>
          <Text 
            className="text-primary-600 text-center underline"
            onPress={() => setShowPaywall(true)}
          >
            View Subscription Options
          </Text>
        </Center>
        <PaywallModal 
          isOpen={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </>
    );
  }

  return (
    <>
      <EditPlaylistForm
        initialValues={playlist}
        onSubmit={onSubmit}
        ApiError={error}
      />
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </>
  );
}
