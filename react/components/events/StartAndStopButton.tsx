import { Button, ButtonIcon } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react-native';
import { useState } from 'react';
import ConfirmModal from '@/components/generics/ConfirmModal';
import { useRouter } from 'expo-router';
import { useEvent } from '@/hooks/useEvent';

type Props = {
  data: MusicEventFetchResult;
  eventId: string;
  isOwner?: boolean;
};

export default function StartAndStopButton({
  data,
  eventId,
  isOwner = false,
}: Props) {
  const router = useRouter();
  const { startEvent, stopEvent } = useEvent(eventId);

  function isInProgress(event: MusicEvent) {
    if (event.done) {
      return false;
    }
    const eventDate = new Date(event.beginning_at);
    const now = new Date();
    return now > eventDate;
  }

  function isDone(event: MusicEvent) {
    return event.done;
  }

  const showStart = () => {
    return isOwner && (isDone(data.event) || !isInProgress(data.event));
  };

  const showStop = () => {
    return isOwner && isInProgress(data.event);
  };

  const [startModal, setStartModal] = useState(false);
  const [stopModal, setStopModal] = useState(false);

  function reload() {
    router.push(`(main)/events/${eventId}`);
  }

  async function submitStartEvent() {
    console.log('START EVENT CONFIRMATION');
    try {
      await startEvent(eventId);
    } catch {
      // Ignore errors
    }
    reload();
  }

  async function submitStopEvent() {
    console.log('STOP EVENT CONFIRMATION');
    try {
      await stopEvent(eventId);
    } catch {
      // Ignore errors
    }
    reload();
  }

  return (
    <>
      {showStart() && (
        <Button
          size='lg'
          className=' rounded-full bg-primary-500 size-14 border-2 border-primary-400 p-1.5'
          action='primary'
          onPress={() => setStartModal(true)}
        >
          <ButtonIcon
            size='xl'
            className='h-8 w-8 text-emerald-300'
            as={Star}
          />
        </Button>
      )}

      {showStop() && (
        <Button
          size='lg'
          className='rounded-full bg-primary-500 size-14 border-2 border-primary-400'
          action='primary'
          onPress={() => setStopModal(true)}
        >
          <ButtonIcon
            size='xl'
            className='h-8 w-8 text-orange-300'
            as={StarOff}
          />
        </Button>
      )}

      <ConfirmModal
        isOpen={startModal}
        setIsOpen={setStartModal}
        title='Start the event?'
        description="If everything is ready, let's get the event started."
        confirmText='Start'
        confirmIcon={Star}
        onConfirm={submitStartEvent}
      />

      <ConfirmModal
        isOpen={stopModal}
        setIsOpen={setStopModal}
        title='Stop the event?'
        description='No more things to eat or drink ? Music getting weird ?'
        confirmText='Stop'
        destructive
        confirmIcon={StarOff}
        onConfirm={submitStopEvent}
      />
    </>
  );
}
