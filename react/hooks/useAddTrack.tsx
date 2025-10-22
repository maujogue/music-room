import { StyleSheet } from 'react-native';
import { addItemToPlaylist } from '@/services/playlist';
import { Icon, AddIcon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import Reanimated from 'react-native-reanimated';

export default function useAddTrack(playlistId: string) {
  const onSwipeableOpen = async (trackId: string) => {
    try {
      console.log('Adding track to playlist:', trackId);
      await addItemToPlaylist(playlistId, [`spotify:track:${trackId}`]);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
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

  const renderRightAction = () => {
    // Placeholder pour future fonctionnalité
    return null;
  };

  return {
    onSwipeableOpen,
    renderLeftAction,
    renderRightAction,
  };
}

const styles = StyleSheet.create({
  addAction: {
    backgroundColor: '#2db300',
    flex: 1,
  },
});
