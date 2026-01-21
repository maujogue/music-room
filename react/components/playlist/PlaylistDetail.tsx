import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
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
import { UserRoundPlus, Lock } from 'lucide-react-native';
import { useProfile } from '@/contexts/profileCtx';
import { useSubscription } from '@/contexts/subscriptionCtx';
import { useAppToast } from '@/hooks/useAppToast';
import { Button, ButtonText } from '@/components/ui/button';
import { presentPaywall } from '@/components/subscription/PaywallModal';

export default function PlaylistDetail() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const {
    playlist,
    loading,
    error,
    refetch,
    deletePlaylist,
    canEdit,
    canInvite,
  } = usePlaylist(playlistId);
  const { profile, isConnectedToSpotify, refreshProfile } = useProfile();
  const { isPremium } = useSubscription();
  const toast = useAppToast();

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [displayInviteButton, setDisplayInviteButton] = useState(false);
  const [displayAddTrackButton, setDisplayAddTrackButton] = useState(false);
  const router = useRouter();

  const showPaywall = async () => {
    await presentPaywall({ isPremium, toast });
  };

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    setDisplayAddTrackButton(
      (playlist?.is_collaborative ||
        playlist?.owner?.id === profile?.id ||
        canEdit) &&
        isPremium &&
        !playlist?.is_spotify_sync &&
        !!isConnectedToSpotify
    );
    setDisplayInviteButton(canInvite && isPremium);
  }, [canEdit, canInvite, playlist, isPremium]);

  const handleAddTrackPress = () => {
    router.push({
      pathname: `(main)/playlists/${playlistId}/tracks/add`,
      params: { playlistTitle: playlist?.name },
    });
  };

  const onDeletePlaylist = async () => {
    setShowAlertDialog(false);
    console.log(`PlaylistDetailScreen(${playlistId}) Playlist delelete call`);

    await deletePlaylist();
    if (!error && !loading) {
      router.push('(main)/playlists/');
    }
  };

  const onCallEdit = () => {
    if (!isPremium) {
      void showPaywall();
      return;
    }
    router.push(`(main)/playlists/${playlistId}/edit`);
  };

  const handleInviteUserPress = () => {
    if (!isPremium) {
      void showPaywall();
      return;
    }
    router.push(`(main)/playlists/${playlistId}/invite`);
  };

  if (loading) {
    return <LoadingSpinner text='Loading Playlist' />;
  }
  if (!isConnectedToSpotify) {
    return (
      <ErrorScreen
        error='You need to connect your Spotify account to view playlist details.'
        actionButton={
          <Button
            className='w-full rounded-full h-12 bg-blue-500'
            onPress={() => {
              refreshProfile();
              refetch();
            }}
          >
            <ButtonText className='font-semibold text-white'>
              Retry Connection
            </ButtonText>
          </Button>
        }
      />
    );
  }
  if (error) {
    return (
      <ErrorScreen
        error={error}
        actionButton={
          <Button onPress={() => refetch()}>
            <ButtonText>Retry</ButtonText>
          </Button>
        }
      />
    );
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
          onAddTrackPress={handleAddTrackPress}
        />
        {/* </Box> */}
      </ScrollView>

      {displayAddTrackButton && (
        <FloatButton
          onPress={handleAddTrackPress}
          icon={AddIcon}
          className='absolute bottom-20 right-4 rounded-full p-4 blurred-bg'
        />
      )}
      {displayInviteButton && (
        <FloatButton
          onPress={handleInviteUserPress}
          icon={UserRoundPlus}
          className='absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
        />
      )}

      {/* Show lock buttons for non-premium users */}
      {canEdit && !isPremium && (
        <>
          <FloatButton
            onPress={() => void showPaywall()}
            icon={Lock}
            className='absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
          />
          {canInvite && (
            <FloatButton
              onPress={() => void showPaywall()}
              icon={UserRoundPlus}
              className='absolute bottom-20 right-4 rounded-full p-4 blurred-bg'
            />
          )}
        </>
      )}

      <DeleteAlert
        showAlertDialog={showAlertDialog}
        setShowAlertDialog={setShowAlertDialog}
        onDelete={onDeletePlaylist}
        itemName={playlist?.name ?? 'playlist'}
        itemType='playlist'
      />

      {playlist && (
        <Playlist3DotMenu
          playlist={playlist}
          callDelete={() => setShowAlertDialog(true)}
          callEdit={onCallEdit}
          isPremium={isPremium}
          onUpgrade={() => void showPaywall()}
          className='absolute bottom-36 right-4 rounded-full p-4 blurred-bg'
        />
      )}
    </>
  );
}
