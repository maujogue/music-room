import { Button, ButtonIcon } from '@/components/ui/button';
import { Play, Square } from 'lucide-react-native';
import { useState } from 'react';
import ConfirmModal from '@/components/generics/ConfirmModal';

type Props = {
  data: MusicEventFetchResult;
};



export default function StartAndStopButton({data} : Props) {

  function isInProgress(event: MusicEvent) {
    if (event.done) { return false }
    const eventDate = new Date(event.beginning_at);
    const now = new Date();
    return now > eventDate;
  }

  function isDone(event: MusicEvent) {
    return event.done
  }

  const showStart = () => {
    return isDone(data.event) || !isInProgress(data.event)
  }

  const showStop = () => {
    return isInProgress(data.event)
  }

  const [startModal, setStartModal] = useState(false)
  const [stopModal, setStopModal] = useState(false)


  return (
  <>
    { showStart() && (
      <Button size='lg'
              className='absolute bottom-4 left-4 rounded-full bg-primary-500/70 w-20 h-20 p-3.5 border-4 border-emerald-200'
              action='primary'
              onPress={() => setStartModal(true)}
            >
        <ButtonIcon size='xl' className='w-12 h-12 text-emerald-200' as={Play} />
      </Button>
    )}

    { showStop() && (
        <Button size='lg'
                className='absolute bottom-4 left-4 rounded-full bg-primary-500/70 w-20 h-20 p-3.5 border-4 border-orange-200'
                action='primary'
                onPress={() => setStopModal(true)}
              >
          <ButtonIcon size='xl' className='w-12 h-12 text-orange-200' as={Square} />
        </Button>
    )}

    <ConfirmModal
      isOpen={startModal}
      setIsOpen={setStartModal}
      title="Start the event?"
      description="If everything is ready, let's get the event started."
      confirmText="Start"
      confirmIcon={Play}
      onConfirm={async () => {
        console.log("START EVENT CONFIRMATION");
      }}
    />

    <ConfirmModal
      isOpen={stopModal}
      setIsOpen={setStopModal}
      title="Stop the event?"
      description="No more things to eat or drink ? Music getting weird ?"
      confirmText="Stop"
      destructive
      confirmIcon={Square}
      onConfirm={async () => {
        console.log("STOP EVENT CONFIRMATION");
      }}
    />
  </>
  )
}