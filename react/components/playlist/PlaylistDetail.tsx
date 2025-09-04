import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
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
import { PlaylistItemsResponse } from '@/types/spotify';
import { ScrollView } from 'react-native';
import { CircleIcon } from '@/components/ui/icon';


export default function PlaylistDetail() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const {
    playlist,
    loading,
    error,
    refetch,
    deletePlaylist
  } = usePlaylist(playlistId);

  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const navigation = useNavigation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (<Playlist3DotMenu callDelete={() => setShowAlertDialog(true)} callEdit={onCallEdit} />),
    });
  }, [navigation]);

  const onDeletePlaylist = async () => {
    // [note] -> Clément :
    // Ici vérifier que la suppression produit bien une goBack dans la navigation
    setShowAlertDialog(false)
    console.log(`PlaylistDetailScreen(${playlistId}) Playlist delelete call`)

    await deletePlaylist();
    if (!error && !loading) {
      router.push('(main)/playlists/')
    }
  }

  const onCallEdit = () => {
    console.log(`Edit call for playlist ${playlistId} | Not implemented yet`)
    // [!] Implement this later (issue #54)
    // Can't retrieve playlist from usePlaylist() in edit.tsx
    // router.push(`(main)/playlists/${playlistId}/edit`)
  }


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

  const playlistTracks: PlaylistItemsResponse = playlist.tracks;
  const imageUri = playlist?.images?.[0]?.url ?? 'https://picsum.photos/300';
  const playlistTitle = playlist?.name ?? 'Playlist';
  const playlistDescription = playlist?.description ?? 'No description available';
  const playlistOwner = playlist?.owner?.display_name ?? 'Unknown';
  const ispublic = playlist?.public ?? false
  const isCollaborative = playlist?.collaborative ?? false

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Image source={{ uri: imageUri }} className="w-full h-80" alt="Playlist image" />
          <VStack className='px-4 pt-2'>
            <HStack className='justify-between'>
              <Heading size='xl'>{playlistTitle}</Heading>
              <HStack className='gap-2'>
                {isCollaborative && (
                  <Badge action="info" className="rounded-full">
                    <BadgeIcon as={CircleIcon} className="" />
                  </Badge>
                )}
                {ispublic ? (
                  <Badge action="success" className="rounded-full">
                    <BadgeText>Public</BadgeText>
                  </Badge>
                ) : (
                  <Badge action="warning" className="rounded-full">
                    <BadgeText>Private</BadgeText>
                  </Badge>
                )}
              </HStack>
            </HStack>
            {playlist?.description ? (
              <Text size='sm' className='color-secondary-700'>{playlistDescription}</Text>
            ) : null}
            <Text size='md' className='color-secondary-700' >By {playlistOwner}</Text>
          </VStack>
        </Card>
        <TrackList
          playlistId={playlistId}
          playlistTracks={playlistTracks}
          onTrackDeleted={refetch}
        />
        {/* </Box> */}
      </ScrollView>

      <DeleteAlert showAlertDialog={showAlertDialog}
        setShowAlertDialog={setShowAlertDialog}
        onDelete={onDeletePlaylist}
        itemName={playlist?.name ?? 'playlist'}
        itemType='playlist' />
    </>
  );
}
