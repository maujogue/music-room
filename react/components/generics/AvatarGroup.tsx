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
  console.log('AvatarGroup users:', users);

  // Vérification de sécurité
  if (!users || !Array.isArray(users) || users.length === 0) {
    return (
      <Pressable onPress={onPress} className="p-2">
        <Text className="text-gray-500">No members yet</Text>
      </Pressable>
    );
  }

  const avatars = users.map(user => ({
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
            <Pressable onPress={onPress}>
              <Avatar
                key={index}
                size="md"
                className={'border-2 border-outline-0 ' + avatar.color}
              >
                <AvatarFallbackText className="text-white">
                  {avatar.alt}
                </AvatarFallbackText>
              </Avatar>
            </Pressable>
          );
        })}
        {remainingCount > 0 && (
          <Pressable onPress={onPress}>
            <Avatar size="md">
              <AvatarFallbackText>{'+ ' + remainingCount}</AvatarFallbackText>
            </Avatar>
          </Pressable>
        )}
      </UIAvatarGroup>
  );
}
