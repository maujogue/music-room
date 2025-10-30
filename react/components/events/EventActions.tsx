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

  const handleOpenInvite = () => {
    router.push(`(main)/events/${eventId}/invite`);
  };

  return (
    <>
      {displayInviteButton && abovePlayer && (
        <>
          <FloatButton
            onPress={handleOpenInvite}
            icon={UserPlus}
            className={'absolute right-4 rounded-full p-4 blurred-bg'}
            style={{
              bottom: 160,
              zIndex: 9999,
              elevation: 20,
              pointerEvents: 'auto',
            }}
          />
        <FloatButton
          onPress={() => setIsDrawerOpen(true)}
          icon={Users}
          className={'absolute right-4 rounded-full p-4 blurred-bg'}
          style={{
            bottom: 100,
            zIndex: 9998,
            elevation: 18,
            pointerEvents: 'auto',
          }}
        />
        </>
      )}
      {displayInviteButton && !abovePlayer && (
        <>
        <FloatButton
          onPress={handleOpenInvite}
          icon={UserPlus}
          className={'absolute bottom-20 right-4 rounded-full p-4 blurred-bg'}
        />
        <FloatButton
          onPress={() => setIsDrawerOpen(true)}
          icon={Users}
        />
        </>
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
