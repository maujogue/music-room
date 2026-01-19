import { StyleSheet } from 'react-native';
import { addItemToPlaylist } from '@/services/playlist';
import { Icon, AddIcon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import Reanimated from 'react-native-reanimated';
import { useAppToast } from '@/hooks/useAppToast';

export default function useAddTrack(playlistId: string) {
  const toast = useAppToast();

  const onSwipeableOpen = async (trackId: string) => {
    try {
      const cleanId = trackId.replace('spotify:track:', '');
      await addItemToPlaylist(playlistId, [cleanId]);
      toast.show({
        title: 'Track added to playlist',
        duration: 1500,
        placement: 'top',
      });
    } catch {
      toast.error({
        title: 'Failed to add track to playlist:',
        description: 'Please try again later.',
      });
    }
  };

  const renderLeftAction = () => {
    return (
      <Reanimated.View style={[styles.addAction]}>
        <Box
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            paddingLeft: 16,
          }}
        >
          <Icon as={AddIcon} color='white' size={'xl'} />
        </Box>
      </Reanimated.View>
    );
  };

  return {
    onSwipeableOpen,
    renderLeftAction,
  };
}

const styles = StyleSheet.create({
  addAction: {
    backgroundColor: '#2db300',
    flex: 1,
  },
});
