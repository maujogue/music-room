import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Icon, MenuIcon } from '@/components/ui/icon';
import { syncSpotifyPlaylists } from '@/services/playlist';
import { RefreshCw } from 'lucide-react-native';
import { useAppToast } from '@/hooks/useAppToast';



export default function PlaylistMenu() {
  const toast = useAppToast();

  const handleSyncSpotifyPress = async () => {
    try {
      await syncSpotifyPlaylists();
      toast.show({ title: 'Synchronized with Spotify' });
    } catch (error) {
      toast.error({ title: 'Failed to sync playlists' });
    }
  };

  return (
    <Menu
      trigger={({ ...triggerProps }) => {
        return (
          <Button {...triggerProps} size='sm' variant='link'>
            <ButtonIcon as={MenuIcon} size='xl' />
          </Button>
        );
      }}
    >
      <MenuItem
        key='spotify-sync'
        textValue='spotify-sync'
        onPress={handleSyncSpotifyPress}
      >
        <Icon as={RefreshCw}
          size='lg'
          className='text-typography-600 mr-2'
        />
        <MenuItemLabel size='md'>Synchronize with Spotify</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
}
