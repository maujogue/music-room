import EditPlayListForm from '@/components/playlist/EditPlaylistForm';
import { useProfile } from '@/contexts/profileCtx';
import { apiFetch } from '@/utils/apiFetch';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppToast } from '@/hooks/useAppToast';

export default function AddNewPlayList() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { profile } = useProfile();
  const toast = useAppToast();

  const onSubmit = async (payload: PlaylistPayload) => {
    console.log('HERE IMPLEMENT POST NEW PLAYLIST TO BACK');
    console.log('payload : ', payload);

    if (!profile) {
      setError('Authentification error, try reconnect with Spotify please');
      return;
    }

    const resp: ApiResponse<SpotifyPlaylist> = await apiFetch<SpotifyPlaylist>(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists`,
      {
        method: 'POST',
        body: payload,
      }
    );

    if (!resp.success) {
      const errorStatus = resp.error?.status;
      const errorMessage = resp.error?.message || 'Unknown API error';
      
      // Show toast for duplicate (409) or forbidden (403) errors
      if (errorStatus === 409 || errorStatus === 403) {
        toast.error({
          title: 'Cannot create playlist',
          description: errorMessage,
        });
      }
      
      setError(errorMessage);
      return;
    }

    router.replace({
      pathname: '/(main)/playlists/[playlistId]',
      params: { playlistId: resp.data.id },
    });
  };

  return <EditPlayListForm onSubmit={onSubmit} ApiError={error} />;
}
