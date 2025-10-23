import React, { useState } from 'react';
import { Pressable } from 'react-native';
import FloatButton from '../generics/FloatButton';
import { 
  Pencil, 
  Heart, 
  Settings as SettingsIcon , 
  LogOut, 
  KeyRound,
  UserPlus,
  UserMinus
} from 'lucide-react-native';
import { 
  Drawer, 
  DrawerContent, 
  DrawerBackdrop, 
  DrawerHeader, 
  DrawerBody,
  DrawerCloseButton
} from '@/components/ui/drawer';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Box } from '@/components/ui/box';

interface ProfileActionsProps {
  isOwner: boolean;
  editProfile: boolean;
  isFollowing?: boolean;
  actions: {
    handleEditToggle: () => void;
    handleSpotifyConnect: () => void;
    handleFollowAction?: () => void;
    signOut: () => void;
  };
}

export default function ProfileActions({ isOwner, editProfile, isFollowing, actions }: ProfileActionsProps) {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      {isOwner ? (
        <Box>
          <FloatButton
            icon={editProfile ? CloseIcon : Pencil}
            onPress={actions.handleEditToggle}
            className="absolute bottom-20 right-4 rounded-full p-4 blurred-bg"
          /> 

          <FloatButton
          icon={SettingsIcon}
          onPress={() => setShowDrawer(true)}
          className="absolute bottom-4 right-4 rounded-full p-4 blurred-bg"
          />
        </Box>
      ): (
        <FloatButton
          icon={isFollowing ? UserMinus : UserPlus}
          onPress={actions.handleFollowAction || (() => {})}
          className="absolute bottom-4 right-4 rounded-full p-4 blurred-bg"
        />
      )}

      {showDrawer && (
      <>
        <Pressable onPress={() => setShowDrawer(false)} />
        <Drawer
        isOpen={showDrawer}
        size="sm"
        anchor="bottom"
        onClose={() => {
          setShowDrawer(false);
        }}
        >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <Heading size="lg">Settings</Heading>
            <DrawerCloseButton>
              <Icon as={CloseIcon} />
            </DrawerCloseButton>
          </DrawerHeader>
          <Divider />
          <DrawerBody className='gap-8'>
          <VStack className='gap-2'>
              {/* Delete Button */}
              <Button
                variant='link'
                className='w-full justify-start'
                onPress={actions.handleSpotifyConnect}
              >
                <HStack className='items-center gap-3'>
                  <KeyRound />
                  <ButtonText>Connect To Spotify</ButtonText>
                </HStack>
              </Button>

              {/* Edit Button */}
              <Button
                variant='link'
                className='w-full justify-start'
                onPress={actions.signOut}
              >
                <HStack className='items-center justify-between w-full'>
                  <HStack className='items-center gap-3'>
                    <LogOut />
                    <ButtonText>Logout</ButtonText>
                  </HStack>
                </HStack>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
        </Drawer>
      </>
      )}
    </>
  );
}