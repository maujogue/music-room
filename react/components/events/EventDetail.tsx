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
import { usePlayer } from '@/contexts/PlayerCtx';
import { useProfile } from '@/contexts/profileCtx';

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const navigation = useNavigation();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const router = useRouter();
  const { data, loading, error, refetch, deleteEvent } = useEvent(eventId);
  const [displayInviteButton, setDisplayInviteButton] = useState(false);
  const { track } = usePlayer();
  const [isActive, setIsActive] = useState<boolean>(false);
  const { profile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    setDisplayInviteButton(data?.user?.can_invite ?? false);
    if (data?.event?.beginning_at) {
      const eventStart = new Date(data.event.beginning_at);
      setIsActive(eventStart <= new Date());
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const isOwner = data?.event?.owner_id === profile?.id;
    navigation.setOptions({
      headerRight: () => (
        <Event3DotMenu
          callDelete={() => setShowAlertDialog(true)}
          callEdit={onEditEvent}
          eventData={data}
          isOwner={isOwner}
        />
      ),
    });
  }, [navigation, data, profile]);

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

  if (!data || loading) {
    return <LoadingSpinner text='Loading Events' />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <>
      <ScrollView className='bg-primary-500'>
        <VStack className='flex-1'>
          <EventHeader
            eventData={data}
            onRefresh={refetch}
          />

          <Center className='flex-1'>
            <VotesRoom
              eventId={eventId}
              isOwner={data?.event?.owner_id === profile?.id}
            />
          </Center>
        </VStack>

        <DeleteAlert
          showAlertDialog={showAlertDialog}
          setShowAlertDialog={setShowAlertDialog}
          onDelete={onDeleteEvent}
          itemName={data.event.name ?? 'event'}
          itemType='event'
        />
      </ScrollView>

      <EventActions
        displayInviteButton={displayInviteButton}
        eventId={eventId}
        eventData={data}
        onUpdated={refetch}
        abovePlayer={isActive && !!track}
      />

      {track && isActive && (
        <Box
          className='absolute bottom-0 right-18 w-full'
          pointerEvents={'auto'}
        >
          <Player showControls={true} />
        </Box>
      )}
    </>
  );
}
