import EditPlayListForm from "@/components/playlist/EditPlaylistForm";
import { useProfile } from "@/contexts/profileCtx";
import { apiFetch } from "@/utils/apiFetch";
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function AddNewPlayList() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { profile } = useProfile();

  const onSubmit = async (payload: PlaylistPayload) => {
    console.log('HERE IMPLEMENT POST NEW PLAYLIST TO BACK');
    console.log('payload : ', payload);

    if (!profile) {
      setError('Authentification error, try reconnect with Spotify please');
      return;
    }

    const resp: ApiResponse<SpotifyPlaylist> = await apiFetch<SpotifyPlaylist>(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists`,
      {
        method: 'POST',
        body: payload,
      }
    );

    if (!resp.success) {
      setError(resp.error ?? 'Unknow API error');
      return;
    }

    router.replace({
      pathname: '/(main)/playlists/[playlistId]',
      params: { playlistId: resp.data.id },
    });
  };

  return <EditPlayListForm onSubmit={onSubmit} ApiError={error} />;
}
