import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';

interface Props {
  eventId: string;
}

export default function VotesRoom({ eventId }: Props) {

  const { data, loading, error } = useEvent(eventId);
  const { playlist, loading: ploading, error: perror, refetch } = usePlaylist(data ? data.event.playlist_id : null);

  if (loading) { return (<LoadingSpinner text="Loading event's data" />) }
  if (ploading) { return (<LoadingSpinner text="Loading event's playlist" />) }
  if (!data || error) { return (<ErrorScreen error={error} />) }
  if (perror|| !playlist) { return (<ErrorScreen error={perror} />) }

  const onTrackSwipe = (dir: SwipeDirection, trackId: string) => {
    console.log(`SWIPE to ${dir} for track(${trackId})!`)
    // TODO : run refetch here or websockets mechanics ?
    refetch();
  }

  return (
    <VStack className='flex-1 w-full px-2'>
      <TrackListVotes
        eventId={eventId}
        playlistId={playlist.id}
        playlistTracks={playlist.tracks}
        onTrackSwiping={(dir, trackId) => { onTrackSwipe(dir, trackId) }}
      />
    </VStack>
  );
}
