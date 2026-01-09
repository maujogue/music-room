import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import FloatButton from '../generics/FloatButton';
import { Bug } from "lucide-react-native";
import {
  Pencil,
  Settings as SettingsIcon,
  LogOut,
  UserPlus,
  UserMinus,
  KeyRound,
} from 'lucide-react-native';
import {
  Drawer,
  DrawerContent,
  DrawerBackdrop,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
} from '@/components/ui/drawer';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Box } from '@/components/ui/box';
import { useProfile } from '@/contexts/profileCtx';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/authCtx';

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

export default function ProfileActions({
  isOwner,
  editProfile,
  isFollowing,
  actions,
}: ProfileActionsProps) {
  const [showDrawer, setShowDrawer] = useState(false);
  const { isConnectedToSpotify } = useProfile();
  const { session } = useAuth();

  function isDev() {
    return process.env.NODE_ENV === 'development'
  }

  function getToken() {
    if (!isDev()) { return }
      console.log("=== DEV MODE BEARER TOKEN ACCESS ===")
      const token = session?.access_token
      console.log(token)
      console.log("=== ============================ ===")
  }

  return (
    <>
      {isOwner ? (
        <Box>
          <FloatButton
            icon={editProfile ? CloseIcon : Pencil}
            onPress={actions.handleEditToggle}
            className='absolute bottom-20 right-4 rounded-full p-4 blurred-bg'
          />

          <FloatButton
            icon={SettingsIcon}
            onPress={() => setShowDrawer(true)}
            className='absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
          />
        </Box>
      ) : (
        <FloatButton
          icon={isFollowing ? UserMinus : UserPlus}
          onPress={actions.handleFollowAction || (() => {})}
          className='absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
        />
      )}

      {showDrawer && (
        <>
          <Pressable onPress={() => setShowDrawer(false)} />
          <Drawer
            isOpen={showDrawer}
            size='lg'
            anchor='bottom'
            onClose={() => {
              setShowDrawer(false);
            }}
          >
            <DrawerBackdrop />
            <DrawerContent>
              <DrawerHeader>
                <Heading size='xl'>Settings</Heading>
                <DrawerCloseButton>
                  <Icon as={CloseIcon} />
                </DrawerCloseButton>
              </DrawerHeader>
              <Divider />
              <DrawerBody className='gap-8'>
                <VStack className='gap-2'>
                  <Text className='text-md font-medium mb-2'>
                    Connect Accounts
                  </Text>
                  <HStack className='justify-between items-center w-full'>
                    <Text className='text-extra-lg font-semibold flex-1'>
                      Spotify
                    </Text>
                    <Button
                      onPress={actions.handleSpotifyConnect}
                      disabled={isConnectedToSpotify}
                      size='sm'
                      className='w-[95px]'
                    >
                      <ButtonText size='xs'>
                        {isConnectedToSpotify ? 'Connected' : 'Connect'}
                      </ButtonText>
                    </Button>
                  </HStack>
                  <HStack className='justify-between items-center w-full'>
                    <Text className='text-extra-lg font-semibold flex-1'>
                      Google
                    </Text>
                    <Button disabled={true} size='sm' className='w-[95px]'>
                      <ButtonText size='xs'>Not Available</ButtonText>
                    </Button>
                  </HStack>
                  <Divider />
                  <HStack className='items-center justify-between w-full pr-28'>
                    <Button
                      variant='link'
                      className='w-full justify-start'
                      onPress={() => {
                        router.push('/update-password');
                        setShowDrawer(false);
                      }}
                    >
                      <HStack className='items-center justify-between w-full'>
                        <HStack className='items-center gap-3'>
                          <KeyRound />
                          <ButtonText>Edit password</ButtonText>
                        </HStack>
                      </HStack>
                    </Button>
                    {isDev() && (
                      <Button
                      variant='link'
                      className='w-full justify-start'
                      onPress={() => {
                        getToken()
                      }}
                    >
                      <HStack className='items-center justify-between w-full'>
                        <HStack className='items-center gap-3'>
                          <Bug />
                          <ButtonText>Jwt</ButtonText>
                        </HStack>
                      </HStack>
                    </Button>
                    )}
                  </HStack>
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
