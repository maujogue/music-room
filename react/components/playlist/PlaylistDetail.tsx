import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackList from '@/components/track/TrackList';
import { useEffect, useState } from 'react';
import Playlist3DotMenu from '@/components/playlist/PlaylistDotMenu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog"
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { CloseIcon, TrashIcon } from '@/components/ui/icon';


export default function PlaylistDetail() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { playlist, loading, error, deletePlaylist } = usePlaylist(playlistId);

  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const handleClose = () => setShowAlertDialog(false)

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (<Playlist3DotMenu callDelete={() => setShowAlertDialog(true)} />),
    });
  }, [navigation]);

  const onDeletePlaylistCall = async () => {
    // [note] -> Clément :
    // Ici vérifier que la suppression produit bien une goBack dans la navigation
    handleClose()
    console.log(`PlaylistDetailScreen(${playlistId}) Playlist delelete call`)

    await deletePlaylist();
    if (!error && !loading) {
      router.push('(main)/playlists/')
    }
  }

  if (loading) {
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

  // TODO : Playist is null : usePlaylist Hook not ready yet
  // if (!playlist) {
  //   return (
  //     <View style={styles.center}>
  //       <Text>No playlist with id '{playlistId}'</Text>
  //     </View>
  //   );
  // }

  const imageUri = playlist?.images?.[0]?.url ?? 'https://picsum.photos/300';
  const playlistTitle = playlist?.name ?? 'Playlist';
  const playlistDescription = playlist?.description ?? 'No description available';
  const playlistOwner = playlist?.owner?.display_name ?? 'Unknown';

  return (
    <>

      <Box className='flex-1'>
        <Card>
          <Image source={{ uri: imageUri }} size="2xl" className="w-full rounded-lg" alt="Playlist image" />
          <VStack className='px-4 pt-2'>
            <Heading size='xl'>{playlistTitle}</Heading>
            {playlist?.description ? (
              <Text size='sm' className='color-secondary-700'>{playlistDescription}</Text>
            ) : null}
            <Text size='md' className='color-secondary-700' >By {playlistOwner}</Text>
          </VStack>
        </Card>
        <TrackList playlistId={playlistId} />
      </Box>

      <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className="text-typography-950 font-semibold" size="md">
              Confirm delete {playlist?.name ?? 'playlist'} ?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text size="sm" className='color-secondary-700'>
              Deleting the playlist will remove it permanently and cannot be undone.
              Please confirm if you want to proceed.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="justify-center">
            <Button
              variant="outline"
              action="secondary"
              onPress={handleClose}
              size="sm"
            >
              <ButtonIcon as={CloseIcon} className="ml-2" />
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button size="sm" onPress={onDeletePlaylistCall}>
              <ButtonIcon as={TrashIcon} className="ml-2" />
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   cover: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
//   description: { fontSize: 16, marginBottom: 12 },
//   owner: { fontSize: 14, color: '#555' },
// });
