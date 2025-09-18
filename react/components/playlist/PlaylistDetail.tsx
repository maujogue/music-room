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
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import DeleteAlert from '@/components/generics/DeleteAlert';
import { ScrollView } from 'react-native';
import { CircleIcon } from '@/components/ui/icon';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';

export default function PlaylistDetail() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const {
    playlist,
    loading,
    error,
    refetch,
    deletePlaylist,
    canEdit
  } = usePlaylist(playlistId);

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
        headerRight: () => (
          playlist && (
            <Playlist3DotMenu
              playlist={playlist}
              callDelete={() => setShowAlertDialog(true)}
              callEdit={onCallEdit}
            />
          )
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
    console.log(`Edit call for playlist ${playlistId}`);
    // Navigation simple vers la page edit avec seulement l'ID
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

  const imageUri = playlist.cover_url ?? 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228';
  const playlistDescription = playlist.description ?? 'No description available';

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: imageUri }}
          className="w-full aspect-square h-100"
          alt='Playlist image'
        />
        <Card>
          <VStack>
            <HStack className='justify-between'>
              <Heading size='4xl'>{playlist.name}</Heading>
              <HStack className='gap-2'>
                {playlist.is_collaborative && (
                  <Badge action='info' className='rounded-full'>
                    <BadgeIcon as={CircleIcon} className='' />
                  </Badge>
                )}
                {!playlist.is_private ? (
                  <Badge action='success' className='rounded-full'>
                    <BadgeText>Public</BadgeText>
                  </Badge>
                ) : (
                  <Badge action='warning' className='rounded-full'>
                    <BadgeText>Private</BadgeText>
                  </Badge>
                )}
              </HStack>
            </HStack>
            {playlist?.description ? (
              <Text size='sm' className='color-secondary-700'>
                {playlistDescription}
              </Text>
            ) : null}
            <HStack className='pt-2'>
              <Avatar size='sm'>
                <AvatarFallbackText>
                  {playlist.owner.username.charAt(0).toUpperCase()}
                </AvatarFallbackText>
                {playlist.owner.avatar_url && <AvatarImage source={{ uri: playlist.owner.avatar_url }} />}
              </Avatar>
              <Text size='md' className='color-secondary-700 pl-2 pt-1'>
                {playlist.owner.username}
              </Text>
            </HStack>
          </VStack>
        </Card>
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
