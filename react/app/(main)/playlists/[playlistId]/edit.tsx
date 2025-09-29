import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useProfile } from '@/contexts/profileCtx';
import { useLocalSearchParams } from 'expo-router';
import { usePlaylist } from '@/hooks/usePlaylist';
import EditPlaylistForm from '@/components/playlist/EditPlaylistForm';
import { Center } from '@/components/ui/center';
import { ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { editPlaylistById } from '@/services/playlist';

export default function EditPlaylist() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();

  const { playlist, loading, error: fetchError } = usePlaylist(playlistId);

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

  if (loading) {
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

  return (
    <EditPlaylistForm
      initialValues={playlist}
      onSubmit={onSubmit}
      ApiError={error}
    />
  );
}
