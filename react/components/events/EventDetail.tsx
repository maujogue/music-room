import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
  useFocusEffect,
} from 'expo-router';
import { Center } from '@/components/ui/center';
import { useCallback, useEffect, useState } from 'react';
import VotesRoom from '@/components/events/eventDetail/VotesRoom';
import GuestsRoom from '@/components/events/eventDetail/GuestsRoom';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import TabButton from '@/components/generics/TabButton';
import DeleteAlert from '@/components/generics/DeleteAlert';
import Event3DotMenu from '@/components/events/eventDetail/EventDotMenu';
import { useEvent } from '@/hooks/useEvent';
import EventHeader from './eventDetail/EventHeader';
import colors from 'tailwindcss/colors';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<'votes' | 'guests'>('votes');
  const [expanded, setIsExpanded] = useState<boolean>(false);
  const navigation = useNavigation();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const router = useRouter();

  const { event, loading, error, refetch, deleteEvent } = useEvent(eventId);

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
    console.log(`PlaylistDetailScreen(${eventId}) Playlist delelete call`);

    await deleteEvent();
    if (!error && !loading) {
      router.push('(main)/events/');
    }
  };

  const onEditEvent = () => {
    console.log(`Edit call for event ${eventId} | Not implemented yet`);
    // [!] Implement this later (see for playlist same => issue #54)
  };

  const onToggleHeader = () => {
    setIsExpanded(v => !v);
  };

  if (!event || loading) {
    return (
      <HStack space='sm'>
        <Spinner color={colors.indigo[500]} />
        <Text size='md'>Loading event</Text>
      </HStack>
    );
  }

  return (
    <>
      <VStack className='flex-1'>
        <EventHeader
          event={event}
          expanded={expanded}
          onToggle={onToggleHeader}
        />

        {/* Votes / Guests tabs */}
        <Center className='flex-1'>
          <VStack className='px-2 pb-2'>
            <HStack className='w-full bg-primary-500 rounded-xl p-2 justify-between'>
              <TabButton
                label={'Votes'}
                isActive={activeTab == 'votes'}
                onPress={() => setActiveTab('votes')}
              />
              <TabButton
                label={'Guests'}
                isActive={activeTab == 'guests'}
                onPress={() => setActiveTab('guests')}
              />
            </HStack>
          </VStack>
          {activeTab == 'votes' ? (
            <VotesRoom eventId={eventId} />
          ) : (
            <GuestsRoom eventId={eventId} />
          )}
        </Center>
        {/* ------------------ */}
      </VStack>

      <DeleteAlert
        showAlertDialog={showAlertDialog}
        setShowAlertDialog={setShowAlertDialog}
        onDelete={onDeleteEvent}
        itemName={event?.name ?? 'event'}
        itemType='event'
      />
    </>
  );
}
