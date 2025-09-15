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
  actions: {
    handleEditToggle: () => void;
    handleSpotifyConnect: () => void;
    handleFollowAction?: () => void;
    handleAvatarUpload: (url: string) => void;
    signOut: () => void;
  };
}

export default function ProfileAvatarSection({
  profile,
  canEdit,
  editProfile,
  isFollowing,
  actions,
}: ProfileAvatarSectionProps) {
  return (
    <VStack className='justify-center items-center p-6 gap-4'>
      <ProfileActions
        canEdit={canEdit}
        editProfile={editProfile}
        isFollowing={isFollowing}
        actions={actions}
      />

      {/* Avatar */}
      <Center>
        <EditAvatar
          url={profile.avatar_url || vibingImg}
          onUpload={actions.handleAvatarUpload}
          isEdit={canEdit && editProfile}
        />
      </Center>
    </VStack>
  );
}
