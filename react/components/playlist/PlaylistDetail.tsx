import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
  useFocusEffect,
} from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackList from '@/components/track/TrackList';
import { useEffect, useState, useCallback } from 'react';
import Playlist3DotMenu from '@/components/playlist/PlaylistDotMenu';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import DeleteAlert from '@/components/generics/DeleteAlert';
import { ScrollView } from 'react-native';
import PlaylistHeader from '@/components/playlist/PlaylistHeader';

export default function PlaylistDetail() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { playlist, loading, error, refetch, deletePlaylist, canEdit } =
    usePlaylist(playlistId);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        playlist && (
          <Playlist3DotMenu
            playlist={playlist}
            callDelete={() => setShowAlertDialog(true)}
            callEdit={onCallEdit}
          />
        ),
    });
  }, [navigation, playlist]);

  const onDeletePlaylist = async () => {
    setShowAlertDialog(false);
    console.log(`PlaylistDetailScreen(${playlistId}) Playlist delelete call`);

    await deletePlaylist();
    if (!error && !loading) {
      router.push('(main)/playlists/');
    }
  };

  const onCallEdit = () => {
    router.push(`(main)/playlists/${playlistId}/edit`);
  };

  if (loading || !playlist) {
    return (
      <Center>
        <ActivityIndicator size='large' />
      </Center>
    );
  }

  if (error) {
    return (
      <Center>
        <Text style={{ color: 'red' }}>{error}</Text>
      </Center>
    );
  }

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PlaylistHeader playlist={playlist} onRefresh={refetch} />
        <TrackList
          playlistId={playlistId}
          playlistTracks={playlist.tracks}
          playlistTitle={playlist.name}
          isSpotifySync={playlist.is_spotify_sync}
          onTrackDeleted={refetch}
          canEdit={canEdit}
        />
        {/* </Box> */}
      </ScrollView>

      <DeleteAlert
        showAlertDialog={showAlertDialog}
        setShowAlertDialog={setShowAlertDialog}
        onDelete={onDeletePlaylist}
        itemName={playlist?.name ?? 'playlist'}
        itemType='playlist'
      />
    </>
  );
}
