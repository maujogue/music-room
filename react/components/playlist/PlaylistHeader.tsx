import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Image } from '@/components/ui/image';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { UserRoundPlus } from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { AvatarGroup } from '@/components/generics/AvatarGroup';
import { Pressable } from '@/components/ui/pressable';
import { useState } from 'react';
import PlaylistMembersDrawer from './PlaylistMembersDrawer';
import LikeButton from '@/components/generics/LikeButton';
import { addUserToPlaylist, removeUserFromPlaylist } from '@/services/playlist';
import { useProfileData } from '@/hooks/useProfileData';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody,
} from '@/components/ui/alert-dialog';
import { ButtonText } from '@/components/ui/button';
import PrivateBadge from '@/components/generics/PrivateBadge';
import CollaborativeBadge from '@/components/generics/CollaborativeBadge';

type Props = {
  playlist: Playlist;
  onRefresh?: () => void;
};

export default function PlaylistHeader({ playlist, onRefresh }: Props) {
  const router = useRouter();
  const { currentUser } = useProfileData();
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showCollaboratorAlert, setShowCollaboratorAlert] = useState(false);
  const handleRefresh = () => {
    if (onRefresh) return onRefresh();
    setShowMembersDrawer(false);
    setTimeout(() => setShowMembersDrawer(true), 50);
  };

  const imageUri =
    playlist.cover_url ??
    'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228';

  const playlistDescription =
    playlist.description ?? 'No description available';

  const handleInviteUserPress = () => {
    router.push(`(main)/playlists/${playlist.id}/invite`);
  };

  const handleMemberAvatarGroupPress = () => {
    console.log('AvatarGroup pressed');
    setShowMembersDrawer(true);
  };

  const handleCloseMembersDrawer = () => {
    setShowMembersDrawer(false);
  };

  const handleLikePlaylist = () => {
    if (!currentUser) {
      console.error('User profile not loaded');
      return;
    }

    const userRole = playlist.user.role;
    if (playlist.user.is_following && userRole === 'collaborator') {
      setShowCollaboratorAlert(true);
      return;
    }

    if (!playlist.user.is_following) {
      addUserToPlaylist(playlist.id, currentUser.id, 'member');
    } else {
      removeUserFromPlaylist(playlist.id, currentUser.id, 'member');
    }
  };

  const handleConfirmCollaboratorDowngrade = () => {
    if (!currentUser) return;
    removeUserFromPlaylist(playlist.id, currentUser.id, 'collaborator');
    setShowCollaboratorAlert(false);
    handleRefresh();
  };

  const handleCancelCollaboratorDowngrade = () => {
    setShowCollaboratorAlert(false);
  };

  return (
    <>
      <Image
        source={{ uri: imageUri }}
        className='w-full aspect-square h-100'
        alt='Playlist image'
      />
      <Card>
        <VStack>
          <HStack className='justify-between items-center'>
            <Heading size='4xl'>{playlist.name}</Heading>
            <HStack className='gap-2'>
              {playlist.is_collaborative && <CollaborativeBadge />}
              {playlist.is_private ? <PrivateBadge /> : null}
            </HStack>
          </HStack>
          {playlist?.description ? (
            <Text size='sm' className='px-4 color-secondary-700'>
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
              {playlist.user.can_invite && (
                <Button
                  size='lg'
                  className='rounded-full p-3.5 w-10'
                  variant='outline'
                  onPress={handleInviteUserPress}
                >
                  <ButtonIcon as={UserRoundPlus} size='sm' />
                </Button>
              )}
              {(() => {
                const allUsers = [
                  ...(playlist.members || []),
                  ...(playlist.collaborators || []),
                ].filter(
                  (user, index, array) =>
                    array.findIndex(u => u.id === user.id) === index
                );

                return allUsers.length > 0 ? (
                  <AvatarGroup
                    users={allUsers}
                    onPress={handleMemberAvatarGroupPress}
                  />
                ) : (
                  <Pressable onPress={handleMemberAvatarGroupPress}>
                    <Text className='p-2'>No members yet</Text>
                  </Pressable>
                );
              })()}
            </HStack>
          </HStack>
          {playlist.user.role !== 'owner' && (
            <Box className='pt-2'>
              <LikeButton
                onPress={handleLikePlaylist}
                isLiked={playlist.user.is_following}
              />
            </Box>
          )}
        </VStack>
      </Card>

      {/* Drawer des membres */}
      <PlaylistMembersDrawer
        playlist={playlist}
        isOpen={showMembersDrawer}
        onClose={handleCloseMembersDrawer}
        onInvitePress={handleInviteUserPress}
        onUpdated={handleRefresh}
      />

      {/* AlertDialog pour collaborateur */}
      <AlertDialog
        isOpen={showCollaboratorAlert}
        onClose={handleCancelCollaboratorDowngrade}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className='text-typography-950 font-semibold' size='md'>
              Lose Collaborator Status?
            </Heading>
            <AlertDialogCloseButton
              onPress={handleCancelCollaboratorDowngrade}
            />
          </AlertDialogHeader>
          <AlertDialogBody className='mt-3 mb-4'>
            <Text size='sm'>
              You are currently a collaborator on this playlist. If you unlike
              it, you will lose your collaborator privileges and become a
              regular member. Are you sure you want to continue?
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className='flex flex-col sm:flex-row sm:justify-end gap-3'>
            <Button
              variant='outline'
              action='secondary'
              onPress={handleCancelCollaboratorDowngrade}
              className='sm:flex-1'
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              action='negative'
              onPress={handleConfirmCollaboratorDowngrade}
              className='sm:flex-1'
            >
              <ButtonText>Yes, Remove</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
