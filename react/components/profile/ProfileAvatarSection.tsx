import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import EditAvatar from '@/components/profile/edit_avatar';
import ProfileActions from '@/components/profile/ProfileActions';
import vibingImg from '@/assets/vibing.jpg';

interface ProfileAvatarSectionProps {
  profile: any;
  canEdit: boolean;
  editProfile: boolean;
  isFollowing?: boolean;
  isOwnProfile: boolean;
  currentUserId?: string;
  onEditToggle: () => void;
  onSpotifyConnect: () => void;
  onSignOut: () => void;
  onFollowAction?: () => void;
  onAvatarUpload: (url: string) => void;
}

export default function ProfileAvatarSection({
  profile,
  canEdit,
  editProfile,
  isFollowing,
  currentUserId,
  onEditToggle,
  onSpotifyConnect,
  onSignOut,
  onFollowAction,
  onAvatarUpload,
}: ProfileAvatarSectionProps) {
  return (
    <VStack className='justify-center items-center p-6 gap-4'>
      <ProfileActions
        canEdit={canEdit}
        editProfile={editProfile}
        isFollowing={isFollowing}
        onEditToggle={onEditToggle}
        onSpotifyConnect={onSpotifyConnect}
        onSignOut={onSignOut}
        onFollowAction={
          !canEdit && profile.id !== currentUserId ? onFollowAction : undefined
        }
      />

      {/* Avatar */}
      <Center>
        <EditAvatar
          url={profile.avatar_url || vibingImg}
          onUpload={onAvatarUpload}
          isEdit={canEdit && editProfile}
        />
      </Center>
    </VStack>
  );
}
