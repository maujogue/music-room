import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import EditAvatar from '@/components/profile/edit_avatar';
import vibingImg from '@/assets/vibing.jpg';

interface ProfileAvatarSectionProps {
  profile: any;
  canEdit: boolean;
  editProfile: boolean;
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
  actions,
}: ProfileAvatarSectionProps) {
  return (
    <VStack className='justify-center items-center py-6 pl-4'>
      {/* Avatar */}
      <Center>
        <EditAvatar
          url={profile.avatar_url || vibingImg}
          username={profile.username}
          onUpload={actions.handleAvatarUpload}
          isEdit={canEdit && editProfile}
        />
      </Center>
    </VStack>
  );
}
