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

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [expanded, setIsExpanded] = useState<boolean>(false);
  const navigation = useNavigation();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const router = useRouter();
  const { data, loading, error, refetch, deleteEvent } = useEvent(eventId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
          <VotesRoom eventId={eventId} onRefresh={refetch} />
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
  );
}
