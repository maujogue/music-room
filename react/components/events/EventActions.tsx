import { useState } from 'react';
import FloatButton from '@/components/generics/FloatButton';
import { Users, UserPlus } from 'lucide-react-native';
import EventMembersDrawer from './EventMembersDrawer';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authCtx';
import StartAndStopButton from '@/components/events/StartAndStopButton';

type Props = {
  displayInviteButton: boolean;
  eventId: string;
  eventData: MusicEventFetchResult;
  onUpdated?: () => void;
  className?: string;
  abovePlayer?: boolean;
};

export default function EventActions({
  displayInviteButton,
  eventId,
  eventData,
  onUpdated,
  abovePlayer = false,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const handleOpenInvite = () => {
    router.push(`(main)/events/${eventId}/invite`);
  };

  const isOwner = () => {
    return eventData.owner.id === currentUser?.id
  }

  return (
    <>
    {isOwner() && (
        <StartAndStopButton data={eventData}/>
      )}
      {displayInviteButton && (
        <FloatButton
          onPress={handleOpenInvite}
          icon={UserPlus}
          className='absolute bottom-20 right-4 rounded-full p-4 blurred-bg'
        />
      )}
      <EventMembersDrawer
        eventData={eventData}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  );
}
