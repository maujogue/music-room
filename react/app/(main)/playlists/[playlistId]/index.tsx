import PlaylistDetail from '@/components/playlist/PlaylistDetail';
import { ProfileProvider } from '@/contexts/profileCtx';

export default function PlaylistDetailScreen() {
  return (
    <ProfileProvider>
      <PlaylistDetail />
    </ProfileProvider>
  );
}
