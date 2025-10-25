import { useState } from 'react';
import FloatButton from '@/components/generics/FloatButton';
import { Users, UserPlus } from 'lucide-react-native';
import EventMembersDrawer from './EventMembersDrawer';
import { useRouter } from 'expo-router';

type Props = {
  displayInviteButton: boolean;
  eventId: string;
  eventData: MusicEventFetchResult;
  onUpdated?: () => void;
  className?: string;
};

export default function EventActions({
  displayInviteButton,
  eventId,
  eventData,
  onUpdated,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const handleOpenInvite = () => {
    router.push(`(main)/events/${eventId}/invite`);
  };

  return (
    <>
      {displayInviteButton && (
        <FloatButton
          onPress={handleOpenInvite}
          icon={UserPlus}
          className='absolute bottom-20 right-4 rounded-full p-4 blurred-bg'
        />
      )}
      <FloatButton
        onPress={() => setIsDrawerOpen(true)}
        icon={Users}
      />
      <EventMembersDrawer
        eventData={eventData}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  );
}
