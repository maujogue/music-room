import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Playlist } from '@/types/playlist';
import {
  UserRoundPlus
} from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/ui/button';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { Divider } from '@/components/ui/divider';
import { ScrollView, View } from 'react-native';
import { Key } from 'lucide-react-native';
import { addUserToPlaylist, removeUserFromPlaylist } from '@/services/playlist';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useState } from 'react';


type Props = {
    playlist: Playlist;
    isOpen: boolean;
    onClose: () => void;
    onInvitePress: () => void;
};

export default function PlaylistMembersDrawer({
    playlist,
    isOpen,
    onClose,
    onInvitePress
}: Props) {

    const handleAddToCollaboratorsPress = async (userId: string) => {
        try {
            await addUserToPlaylist(playlist.id, userId, 'collaborator');
        } catch (error) {
            console.error('Failed to add user to collaborators:', error);
        }
    }
    const filteredCollaborators = playlist.collaborators?.filter(collab =>
        collab.id !== playlist.owner.id
    ) || [];

    const collaboratorIds = filteredCollaborators.map(collab => collab.id) || [];
    const filteredMembers = playlist.members?.filter(member =>
        !collaboratorIds.includes(member.id) && member.id !== playlist.owner.id
    ) || [];

    return (
        <Drawer isOpen={isOpen} onClose={onClose}>
            <DrawerBackdrop />
            <DrawerContent className="w-full max-h-[70vh]">
                <ScrollView className="flex-1">
                    <DrawerHeader>
                        <HStack className="items-center">
                            <Text size="lg" className="font-semibold flex-1 text-left">
                                Playlist Members
                            </Text>
                            <Button
                                size="lg"
                                className="rounded-full p-3.5 w-10"
                                variant="outline"
                                onPress={onInvitePress}
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

                        {/* Collaborators */}
                        {filteredCollaborators && filteredCollaborators.length > 0 && (
                            <>
                                <Divider className="my-2" />
                                <VStack className="gap-2">
                                    <Text size="sm" className="font-medium text-gray-600">
                                        Collaborators ({filteredCollaborators.length})
                                    </Text>
                                    {filteredCollaborators.map((collaborator, index) => (
                                        <HStack key={index} className="items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                            <Avatar size="md">
                                                <AvatarFallbackText>
                                                    {collaborator.username.charAt(0).toUpperCase()}
                                                </AvatarFallbackText>
                                                {collaborator.avatar_url && (
                                                    <AvatarImage source={{ uri: collaborator.avatar_url }} />
                                                )}
                                            </Avatar>
                                            <VStack>
                                                <Text size="md" className="font-medium">{collaborator.username}</Text>
                                                <Text size="sm" className="text-blue-600">Collaborator</Text>
                                            </VStack>
                                        </HStack>
                                    ))}
                                </VStack>
                            </>
                        )}

                        {/* Members */}
                        {filteredMembers && filteredMembers.length > 0 && (
                            <>
                                <Divider className="my-2" />
                                <VStack className="gap-2">
                                    <Text size="sm" className="font-medium text-gray-600">
                                        Members ({filteredMembers.length})
                                    </Text>
                                    {filteredMembers.map((member, index) => (
                                        <HStack key={index} className="items-center gap-3 p-2 bg-blue-50 rounded-lg justify-between">
                                            <HStack className="items-center gap-3">
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
                                                <Text size="sm" className="text-blue-600">Member</Text>
                                            </VStack>
                                            </HStack>
                                            <Button size="sm" className="rounded-full" onPress={() => handleAddToCollaboratorsPress(member.id)}>
                                                <ButtonIcon as={Key} />
                                            </Button>
                                        </HStack>
                                    ))}
                                </VStack>
                            </>
                        )}

                        {/* No members message */}
                        {(!filteredCollaborators || filteredCollaborators.length === 0) &&
                         (!filteredMembers || filteredMembers.length === 0) && (
                            <>
                                <Divider className="my-2" />
                                <Text className="text-center text-gray-500 p-4">
                                    No collaborators or members yet. Invite people to collaborate!
                                </Text>
                            </>
                        )}
                    </DrawerBody>
                </ScrollView>
            </DrawerContent>
        </Drawer>
    );
}
