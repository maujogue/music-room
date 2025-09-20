import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { CircleIcon } from '@/components/ui/icon';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Image } from '@/components/ui/image';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Playlist } from '@/types/playlist';
import {
  UserRoundPlus
} from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { AvatarGroup } from '@/components/generics/AvatarGroup';
import { Pressable } from '@/components/ui/pressable';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { Divider } from '@/components/ui/divider';
import { useState } from 'react';
import { ScrollView } from 'react-native';

type Props = {
    playlist: Playlist;
    };

export default function PlaylistHeader({ playlist }: Props) {
    console.log('PlaylistHeader playlist:', playlist.members);
    const router = useRouter();
    const [showMembersDrawer, setShowMembersDrawer] = useState(false);

    const imageUri =
    playlist.cover_url ??
    'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228';

    const playlistDescription = playlist.description ?? 'No description available';

    const handleInviteUserPress = () => {
        router.push(`(main)/playlists/${playlist.id}/invite`);
    }

    const handleMemberAvatarGroupPress = () => {
        console.log('AvatarGroup pressed');
        setShowMembersDrawer(true);
    }

    const handleCloseMembersDrawer = () => {
        setShowMembersDrawer(false);
    }

    return (
        <>
        <Image
            source={{ uri: imageUri }}
            className='w-full aspect-square h-100'
            alt='Playlist image'
        />
        <Card>
            <VStack>
                <HStack className='justify-between'>
                <Heading size='4xl'>{playlist.name}</Heading>
                <HStack className='gap-2'>
                    {playlist.is_collaborative && (
                    <Badge action='info' className='rounded-full'>
                        <BadgeIcon as={CircleIcon} className='' />
                    </Badge>
                    )}
                    {!playlist.is_private ? (
                    <Badge action='success' className='rounded-full'>
                        <BadgeText>Public</BadgeText>
                    </Badge>
                    ) : (
                    <Badge action='warning' className='rounded-full'>
                        <BadgeText>Private</BadgeText>
                    </Badge>
                    )}
                </HStack>
                </HStack>
                {playlist?.description ? (
                <Text size='sm' className='color-secondary-700'>
                    {playlistDescription}
                </Text>
                ) : null}
                <HStack className='pt-2 justify-between items-center'>
                    <HStack>
                        <Avatar size='sm'>
                            <AvatarFallbackText>
                            {playlist.owner.username.charAt(0).toUpperCase()}
                            </AvatarFallbackText>
                            {playlist.owner.avatar_url && (
                            <AvatarImage source={{ uri: playlist.owner.avatar_url }} />
                            )}
                        </Avatar>
                        <Text size='md' className='color-secondary-700 pl-2 pt-1'>
                            {playlist.owner.username}
                        </Text>
                    </HStack>
                    <HStack>
                        <Button
                            size="lg"
                            className="rounded-full p-3.5 w-10"
                            variant="outline"
                            onPress={handleInviteUserPress}
                        >
                            <ButtonIcon as={UserRoundPlus} size="sm"/>
                        </Button>
                        {playlist.members && playlist.members.length > 0 ? (
                            <AvatarGroup
                                users={playlist.members}
                                onPress={handleMemberAvatarGroupPress}
                            />
                        ) : (
                            <Pressable onPress={handleMemberAvatarGroupPress}>
                                <Text className="p-2">No members yet</Text>
                            </Pressable>
                        )}
                    </HStack>
                </HStack>
            </VStack>
            </Card>

            {/* Drawer des membres */}
            <Drawer isOpen={showMembersDrawer} onClose={handleCloseMembersDrawer}>
                    <DrawerBackdrop />
                    <DrawerContent className="w-full max-h-[70vh]">
                        <ScrollView className="flex-1">
                        <DrawerHeader>
                            <HStack className="items-center">
                                <Text size="lg" className="font-semibold flex-1 text-left">Playlist Members</Text>
                                <Button
                                    size="lg"
                                    className="rounded-full p-3.5 w-10"
                                    variant="outline"
                                    onPress={handleInviteUserPress}
                                >
                                    <ButtonIcon as={UserRoundPlus} size="sm" />
                                </Button>
                            </HStack>
                        </DrawerHeader>

                        <DrawerBody contentContainerClassName="gap-3" className="flex-1 overflow-y-auto">
                            {/* Owner */}
                            <VStack className="gap-2">
                                <Text size="sm" className="font-medium text-gray-600">Owner</Text>
                                <HStack className="items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <Avatar size="md">
                                        <AvatarFallbackText>
                                            {playlist.owner.username.charAt(0).toUpperCase()}
                                        </AvatarFallbackText>
                                        {playlist.owner.avatar_url && (
                                            <AvatarImage source={{ uri: playlist.owner.avatar_url }} />
                                        )}
                                    </Avatar>
                                    <VStack>
                                        <Text size="md" className="font-medium">{playlist.owner.username}</Text>
                                        <Text size="sm" className="text-gray-500">Owner</Text>
                                    </VStack>
                                </HStack>
                            </VStack>

                            {/* Members */}
                            {playlist.members && playlist.members.length > 0 && (
                                <>
                                    <Divider className="my-2" />
                                    <VStack className="gap-2">
                                        <Text size="sm" className="font-medium text-gray-600">
                                            Members ({playlist.members.length})
                                        </Text>
                                        {playlist.members.map((member, index) => (
                                            <HStack key={index} className="items-center gap-3 p-2 rounded-lg">
                                                <Avatar size="md">
                                                    <AvatarFallbackText>
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </AvatarFallbackText>
                                                    {member.avatar_url && (
                                                        <AvatarImage source={{ uri: member.avatar_url }} />
                                                    )}
                                                </Avatar>
                                                <VStack>
                                                    <Text size="md" className="font-medium">{member.username}</Text>
                                                    <Text size="sm" className="text-gray-500">Member</Text>
                                                </VStack>
                                            </HStack>
                                        ))}
                                    </VStack>
                                </>
                            )}

                            {/* No members message */}
                            {(!playlist.members || playlist.members.length === 0) && (
                                <>
                                    <Divider className="my-2" />
                                    <Text className="text-center text-gray-500 p-4">
                                        No members yet. Invite people to collaborate!
                                    </Text>
                                </>
                            )}
                        </DrawerBody>
                        </ScrollView>
                    </DrawerContent>
            </Drawer>
        </>
    );
}
