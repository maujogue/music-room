import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
  useFocusEffect,
} from 'expo-router';
import { Center } from '@/components/ui/center';
import { useCallback, useEffect, useState } from 'react';
import VotesRoom from '@/components/events/eventDetail/VotesRoom';
import { VStack } from '@/components/ui/vstack';
import DeleteAlert from '@/components/generics/DeleteAlert';
import Event3DotMenu from '@/components/events/eventDetail/EventDotMenu';
import { useEvent } from '@/hooks/useEvent';
import EventHeader from './eventDetail/EventHeader';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { ScrollView } from 'react-native';
import EventActions from '@/components/events/EventActions';
import Player from '@/components/player/Player';
import { Box } from '@/components/ui/box';
import { usePlayer } from '@/hooks/usePlayer';

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [expanded, setIsExpanded] = useState<boolean>(false);
  const navigation = useNavigation();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const router = useRouter();
  const { data, loading, error, refetch, deleteEvent } = useEvent(eventId);
  const [displayInviteButton, setDisplayInviteButton] = useState(false);
  const { track, isPlaying, handlePlayPause, handleNext } = usePlayer();
  const [isActive, setIsActive] = useState<boolean>(false)

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    setDisplayInviteButton(data?.user?.can_invite ?? false);
    if (data?.event?.beginning_at) {
      console.log('Event is active:', data.event.beginning_at > new Date().toISOString());
      const eventStart = new Date(data.event.beginning_at);
      setIsActive(eventStart >= new Date());
    }
  }, [data]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Event3DotMenu
          callDelete={() => setShowAlertDialog(true)}
          callEdit={onEditEvent}
        />
      ),
    });
  }, [navigation]);

  const onDeleteEvent = async () => {
    setShowAlertDialog(false);

    await deleteEvent();
    if (!error && !loading) {
      router.push('(main)/events/');
    }
  };

  const onEditEvent = () => {
    router.push(`(main)/events/${eventId}/edit`);
  };

  const onToggleHeader = () => {
    setIsExpanded(v => !v);
  };

  if (!data || loading) {
    return <LoadingSpinner text='Loading Events' />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <>
      <ScrollView>
        <VStack className='flex-1'>
          <EventHeader
            eventData={data}
            expanded={expanded}
            onToggle={onToggleHeader}
            onRefresh={refetch}
          />

          {/* Votes / Guests tabs */}
          <Center className='flex-1'>
            <VotesRoom eventId={eventId} />
          </Center>
          {/* ------------------ */}
        </VStack>

        <DeleteAlert
          showAlertDialog={showAlertDialog}
          setShowAlertDialog={setShowAlertDialog}
          onDelete={onDeleteEvent}
          itemName={data.event.name ?? 'event'}
          itemType='event'
        />
      </ScrollView>
      <Box className='absolute w-full h-full pointer-events-none' style={{ zIndex: 9999, elevation: 30 }}>
        <EventActions
          displayInviteButton={displayInviteButton}
          eventId={eventId}
          eventData={data}
          onUpdated={refetch}
          abovePlayer={(isActive && !!track)}
        />
      </Box>
      {track && isActive && (
        <Box className='absolute bottom-0 right-18 w-full pointer-events-auto'>
          <Player
            track={track}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            showControls={true}
          />
        </Box>
      )}
    </>
  );
}
