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
import { UserRoundPlus, Lock } from 'lucide-react-native';
import { useProfile } from '@/contexts/profileCtx';
import { useSubscription } from '@/contexts/subscriptionCtx';
import { useAppToast } from '@/hooks/useAppToast';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { RefreshCw } from 'lucide-react-native';
import PaywallModal from '@/components/subscription/PaywallModal';

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
  const { isConnectedToSpotify, connectSpotify, refreshProfile } = useProfile();
  const { isPremium } = useSubscription();
  const toast = useAppToast();

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [displayInviteButton, setDisplayInviteButton] = useState(false);
  const [displayAddTrackButton, setDisplayAddTrackButton] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    setDisplayAddTrackButton(
      canEdit &&
        isPremium &&
        !playlist?.is_spotify_sync &&
        (playlist?.tracks.length ?? 0) > 0 &&
        !!isConnectedToSpotify
    );
    setDisplayInviteButton(canInvite && isPremium);
  }, [canEdit, canInvite, playlist, isPremium]);

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
            isPremium={isPremium}
            onUpgrade={() => setShowPaywall(true)}
          />
        ),
    });
  }, [navigation, playlist, isPremium]);

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
      setShowPaywall(true);
      return;
    }
    router.push(`(main)/playlists/${playlistId}/edit`);
  };

  const handleInviteUserPress = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    router.push(`(main)/playlists/${playlistId}/invite`);
  };

  const handleConnectSpotify = async () => {
    try {
      const { error } = await connectSpotify();
      if (error) {
        throw error;
      }
      setTimeout(async () => {
        await refreshProfile();
        refetch();
      }, 1000);
    } catch (error) {
      toast.error({
        title: 'Spotify Connection Error',
        description: (error as Error).message,
        duration: 3000,
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text='Loading Playlist' />;
  }
  if (!isConnectedToSpotify) {
    return (
      <ErrorScreen
        error='You need to connect your Spotify account to view playlist details.'
        actionButton={
          <HStack space='md' className='items-center justify-center'>
            <Button onPress={handleConnectSpotify}>
              <ButtonText>Connect Spotify</ButtonText>
            </Button>
            <Button
              onPress={() => {
                refreshProfile();
                refetch();
              }}
              className='rounded-full'
              variant='link'
            >
              <RefreshCw size={20} />
            </Button>
          </HStack>
        }
      />
    );
  }
  if (error) {
    return (
      <ErrorScreen
        error={error}
        actionButton={
          <Button onPress={refetch}>
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
        />
        {/* </Box> */}
      </ScrollView>

      {displayAddTrackButton && (
        <FloatButton onPress={handleAddTrackPress} icon={AddIcon} />
      )}
      {displayInviteButton && (
        <FloatButton
          onPress={handleInviteUserPress}
          icon={UserRoundPlus}
          className={`absolute bottom-${displayAddTrackButton ? '20' : '4'} right-4 rounded-full p-4 blurred-bg`}
        />
      )}
      
      {/* Show lock buttons for non-premium users */}
      {canEdit && !isPremium && (
        <>
          <FloatButton
            onPress={() => setShowPaywall(true)}
            icon={Lock}
            className="absolute bottom-4 right-4 rounded-full p-4 blurred-bg"
          />
          {canInvite && (
            <FloatButton
              onPress={() => setShowPaywall(true)}
              icon={UserRoundPlus}
              className="absolute bottom-20 right-4 rounded-full p-4 blurred-bg"
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

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </>
  );
}
