import React from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon, SettingsIcon, CloseIcon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from '@/components/ui/menu';

interface ProfileActionsProps {
  canEdit: boolean;
  editProfile: boolean;
  isFollowing?: boolean;
  onEditToggle: () => void;
  onSpotifyConnect: () => void;
  onSignOut: () => void;
  onFollowAction?: () => void;
}

export default function ProfileActions({
  canEdit,
  editProfile,
  isFollowing,
  onEditToggle,
  onSpotifyConnect,
  onSignOut,
  onFollowAction,
}: ProfileActionsProps) {
  return (
    <>
      {/* Settings and Edit Profile Buttons - Only for own profile */}
      {canEdit && (
        <View className='flex-row justify-between mt-2 w-full gap-3'>
          {/* Settings Menu */}
          <View className='flex-1'>
            <Menu
              trigger={({ ...triggerProps }) => (
                <Button
                  {...triggerProps}
                  variant='outline'
                  className='w-full border-primary-500'
                >
                  <ButtonText className='text-primary-500'>Settings</ButtonText>
                </Button>
              )}
            >
              <MenuItem textValue='Connect Spotify Account' onPress={onSpotifyConnect}>
                <Icon as={SettingsIcon} size='sm' className='mr-3' />
                <MenuItemLabel>Connect Spotify Account</MenuItemLabel>
              </MenuItem>
              <MenuSeparator />
              <MenuItem textValue='Logout' onPress={onSignOut}>
                <Icon as={CloseIcon} size='sm' className='mr-3' />
                <MenuItemLabel>Logout</MenuItemLabel>
              </MenuItem>
            </Menu>
          </View>

          {/* Edit Profile Button */}
          <View className='flex-1'>
            <Button
              className={`w-full ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
              onPress={onEditToggle}
            >
              <ButtonText className='text-white'>
                {editProfile ? 'Save' : 'Edit Profile'}
              </ButtonText>
            </Button>
          </View>
        </View>
      )}

      {/* Follow Button - Only for other users */}
      {!canEdit && onFollowAction && (
        <Button
          variant={isFollowing ? 'outline' : 'solid'}
          onPress={onFollowAction}
          className={isFollowing ? 'border-primary-500' : 'bg-primary-500'}
        >
          <ButtonText className={isFollowing ? 'text-primary-500' : 'text-white'}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </ButtonText>
        </Button>
      )}
    </>
  );
}
