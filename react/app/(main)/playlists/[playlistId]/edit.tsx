import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePlaylist } from '@/hooks/usePlaylist';
import EditPlaylistForm from '@/components/playlist/EditPlaylistForm';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { editPlaylistById } from '@/services/playlist';
import { useAppToast } from '@/hooks/useAppToast';

export default function EditPlaylist() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const toast = useAppToast();

  const { playlist, error: fetchError } = usePlaylist(playlistId);

  const onSubmit = async (payload: PlaylistPayload) => {
    await editPlaylistById(playlistId, payload)
      .then(() => {
        router.push(`(main)/playlists/${playlistId}`);
      })
      .catch(err => {
        console.error('Error editing playlist:', err);
        const errorStatus = err?.status;
        const errorMessage = err?.message || 'Failed to edit playlist. Please try again.';
        
        // Show toast for duplicate (409) or forbidden (403) errors
        if (errorStatus === 409 || errorStatus === 403) {
          toast.error({
            title: 'Cannot update playlist',
            description: errorMessage,
          });
        }
        
        setError(errorMessage);
      });
  };

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
    <>
      <EditPlaylistForm
        initialValues={playlist}
        onSubmit={onSubmit}
        ApiError={error}
      />
    </>
  );
}
