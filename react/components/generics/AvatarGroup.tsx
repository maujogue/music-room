import {
  Avatar,
  AvatarFallbackText,
  AvatarGroup as UIAvatarGroup,
} from '@/components/ui/avatar';
import { Pressable } from '@/components/ui/pressable';
import { PlaylistMember } from '@/types/playlist';

type Props = {
  users: PlaylistMember[];
  onPress?: () => void;
};

export function AvatarGroup({ users, onPress }: Props) {
  const uniqueUsers = users.filter(
    (user, index, self) =>
      index === self.findIndex(u => u.id === user.id) && user.role !== 'owner'
  );
  const avatars = uniqueUsers.map(user => ({
    src: user.avatar_url,
    alt: user.username,
    color: 'bg-gray-600',
  }));

  const extraAvatars = avatars.slice(3);
  const remainingCount = extraAvatars.length;

  return (
    <UIAvatarGroup>
      {avatars.slice(0, 3).map((avatar, index) => {
        return (
          <Pressable key={index} onPress={onPress}>
            <Avatar
              size='md'
              className={'border-2 border-outline-0 ' + avatar.color}
            >
              <AvatarFallbackText className='text-white'>
                {avatar.alt}
              </AvatarFallbackText>
            </Avatar>
          </Pressable>
        );
      })}
      {remainingCount > 0 && (
        <Pressable key='remaining' onPress={onPress}>
          <Avatar size='md'>
            <AvatarFallbackText>{'+ ' + remainingCount}</AvatarFallbackText>
          </Avatar>
        </Pressable>
      )}
    </UIAvatarGroup>
  );
}
