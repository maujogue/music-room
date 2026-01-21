import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import PlaylistMembersView from '@/components/playlist/PlaylistMembersView';
import { usePlaylist } from '@/hooks/usePlaylist';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { useCallback } from 'react';

export default function PlaylistMembersScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const router = useRouter();
  const { playlist, loading, error, refetch } = usePlaylist(playlistId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleInvitePress = () => {
    router.push(`(main)/playlists/${playlistId}/invite`);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <LoadingSpinner text='Loading members...' />;
  }

  if (error || !playlist) {
    return <ErrorScreen error={error || 'Playlist not found'} />;
  }

  return (
    <PlaylistMembersView
      playlist={playlist}
      onBack={handleBack}
      onInvitePress={handleInvitePress}
      onUpdated={refetch}
    />
  );
}
