import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
  useFocusEffect,
} from 'expo-router';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackList from '@/components/track/TrackList';
import { useEffect, useState, useCallback } from 'react';
import Playlist3DotMenu from '@/components/playlist/PlaylistDotMenu';
import DeleteAlert from '@/components/generics/DeleteAlert';
import { ScrollView } from 'react-native';
import PlaylistHeader from '@/components/playlist/PlaylistHeader';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import FloatButton from '@/components/generics/FloatButton';
import { AddIcon } from '@/components/ui/icon';
import { UserRoundPlus } from 'lucide-react-native';

export default function PlaylistDetail() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { 
    playlist, 
    loading, 
    error, 
    refetch, 
    deletePlaylist, 
    canEdit, 
    canInvite 
  } = usePlaylist(playlistId);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [displayInviteButton, setDisplayInviteButton] = useState(false);
  const [displayAddTrackButton, setDisplayAddTrackButton] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    setDisplayAddTrackButton(canEdit && !playlist?.is_spotify_sync && (playlist?.tracks.length ?? 0) > 0);
    setDisplayInviteButton(canInvite);
  }, [canEdit, canInvite, playlist]);

  const handleAddTrackPress = () => {
    router.push({
      pathname: '/(main)/playlists/[playlistId]/tracks/add',
      params: { playlistId, playlistTitle: playlist!.name },
    });
  };

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

  const handleInviteUserPress = () => {
    router.push(`(main)/playlists/${playlistId}/invite`);
  }

  if (loading) {
    return <LoadingSpinner text='Loading Playlist' />;
  }
  if (error) {
    return <ErrorScreen error={error} />;
  }
  if (!playlist) {
    return <ErrorScreen error={"Can't retreive playlist"} />;
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

      {displayAddTrackButton && (
        <FloatButton 
          onPress={handleAddTrackPress} 
          icon={AddIcon}
        />
      )}
      {displayInviteButton && (
        <FloatButton
          onPress={handleInviteUserPress}
          icon={UserRoundPlus}
          className={`absolute bottom-${displayAddTrackButton ? '20' : '4'} right-4 rounded-full p-4 blurred-bg`}
        />
      )}

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
