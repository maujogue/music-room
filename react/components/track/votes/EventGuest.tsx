import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { useState } from 'react';
import { AvatarGroup } from '@/components/generics/AvatarGroup';
import { Button, ButtonIcon } from '@/components/ui/button';
import EventMembersDrawer from '@/components/events/EventMembersDrawer';
import { useRouter } from 'expo-router';
import { UserRoundPlus } from 'lucide-react-native';

interface Props {
  eventData: MusicEventFetchResult;
  onRefresh: () => void;
}

export default function TopVotesTracks({ eventData, onRefresh }: Props) {
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const router = useRouter();

  const handleMemberAvatarGroupPress = () => {
    setShowMembersDrawer(true);
  };

  const handleCloseMembersDrawer = () => {
    setShowMembersDrawer(false);
  };

  const handleInviteUserPress = () => {
    router.push(`(main)/events/${eventData.event.id}/invite`);
  };

  return (
    <VStack className='w-full pt-4'>
      <Heading>Guests</Heading>
      <HStack className='w-full gap-2'>
        <HStack className='w-full items-end justify-between px-2'>
          <AvatarGroup
            users={eventData.members.map(member => member.profile)}
            onPress={handleMemberAvatarGroupPress}
          />
          {eventData?.user?.can_invite && (
            <Button
              size='lg'
              className='rounded-full p-3.5 w-10'
              variant='outline'
              onPress={handleInviteUserPress}
            >
              <ButtonIcon as={UserRoundPlus} size='sm' />
            </Button>
          )}
        </HStack>
      </HStack>
      <EventMembersDrawer
        eventData={eventData}
        isOpen={showMembersDrawer}
        onClose={handleCloseMembersDrawer}
        onInvitePress={handleInviteUserPress}
        onUpdated={onRefresh}
      />
    </VStack>
  );
}
