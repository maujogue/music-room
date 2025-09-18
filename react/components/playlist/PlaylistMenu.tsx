import {
  Menu,
  MenuItem,
  MenuItemLabel,
} from '@/components/ui/menu';
import { Button, ButtonIcon } from '@/components/ui/button';
import { MenuIcon } from '@/components/ui/icon';
import { syncSpotifyPlaylists } from '@/services/playlist';

export default function PlaylistMenu() {
  const handleSyncSpotifyPress = async () => {
      try {
        await syncSpotifyPlaylists();
        alert('Playlists synced successfully!');
      }
      catch (error) {
        console.error('Error syncing playlists:', error);
        alert('Failed to sync playlists.');
      }
  };

  return (
    <Menu
      trigger={({ ...triggerProps }) => {
        return (
          <Button
            {...triggerProps}
            size="sm"
            variant="link"
          >
            <ButtonIcon
              as={MenuIcon}
              size="xl"
            />
          </Button>
        );
      }}
    >
      <MenuItem
        key="spotify-sync"
        textValue="spotify-sync"
        onPress={handleSyncSpotifyPress}
      >
        <MenuItemLabel size="md">Sync Spotify playlist</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
}
