import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { CloseIcon } from '@/components/ui/icon';


interface Props {
  guest: UserInfo;
  onRemove?: (user: UserInfo) => void;
  showRemove?: boolean;
}

export default function GuestsRoomListItem({ guest, onRemove, showRemove = false }: Props) {
  return (
    <HStack space="md" className="justify-between items-center py-2 px-4">
      <HStack space="md" className="items-center pl-4">
        <Avatar size="md">
          <AvatarFallbackText>{guest.username}</AvatarFallbackText>
          <AvatarImage source={{ uri: guest.avatar_url }} />
        </Avatar>
        <Text>{guest.username}</Text>
      </HStack>

      {showRemove && onRemove ? (
        <Button size='sm'
            action='secondary'
            variant='solid'
            className='rounded-2xl' onPress={() => onRemove(guest)}>
          <ButtonIcon as={CloseIcon} className='rounded-full' />
        </Button>
      ) : null }
    </HStack>
  )
}
