import { Button } from '@/components/ui/button';
import {
  ThreeDotsIcon,
  Icon,
  GlobeIcon,
  PaperclipIcon,
  SettingsIcon,
  TrashIcon,
  EditIcon,
} from '@/components/ui/icon';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { Badge, BadgeText } from '@/components/ui/badge';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Divider } from '@/components/ui/divider';
import { useState } from 'react';
import { Image } from '@/components/ui/image';

interface Props {
  playlist: Playlist;
  callDelete: () => void;
  callEdit: () => void;
  canEdit?: boolean;
}

export default function Playlist3DotMenu({
  playlist,
  callDelete,
  callEdit,
  canEdit,
}: Props) {
  const imageUri =
    playlist?.cover_url ??
    'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228';
  const [showDrawer, setShowDrawer] = useState(false);

  const handleClose = () => setShowDrawer(false);

  return (
    <>
      <Button
        size='sm'
        action='secondary'
        variant='solid'
        className='rounded-2xl'
        onPress={() => setShowDrawer(true)}
      >
        <Icon as={ThreeDotsIcon} size='md' />
      </Button>

      <Drawer isOpen={showDrawer} onClose={handleClose}>
        <DrawerBackdrop />
        <DrawerContent className='w-[270px] md:w-[300px]'>
          <DrawerHeader>
            <HStack className='gap-3 items-center'>
              <Image
                source={{ uri: imageUri }}
                className='w-20 h-20 aspect-square '
                alt='Playlist image'
              />
              <Text size='4xl' className='font-semibold'>
                {playlist?.name}
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody contentContainerClassName='gap-2'>
            <Pressable
              className='gap-3 flex-row items-center hover:bg-background-50 p-3 rounded-md'
              onPress={() => {
                handleClose();
                callDelete();
              }}
            >
              <Icon as={TrashIcon} size='lg' className='text-red-500' />
              <Text className='text-red-500'>Delete</Text>
            </Pressable>

            <Pressable
              className='gap-3 flex-row items-center hover:bg-background-50 p-3 rounded-md'
              onPress={() => {
                handleClose();
                callEdit();
              }}
            >
              <Icon as={EditIcon} size='lg' className='text-typography-600' />
              <Text>Edit</Text>
            </Pressable>
            <Divider className='my-2' />

            {/* MOCK MENU */}
            <Pressable
              className='gap-3 flex-row items-center justify-between hover:bg-background-50 p-3 rounded-md opacity-50'
              disabled
            >
              <HStack className='gap-3 items-center'>
                <Icon
                  as={GlobeIcon}
                  size='lg'
                  className='text-typography-600'
                />
                <Text className='text-typography-600'>Share</Text>
              </HStack>
              <Badge action='success' className='rounded-full'>
                <BadgeText className='text-2xs capitalize'>
                  Coming soon
                </BadgeText>
              </Badge>
            </Pressable>

            <Pressable
              className='gap-3 flex-row items-center hover:bg-background-50 p-3 rounded-md opacity-50'
              disabled
            >
              <Icon
                as={PaperclipIcon}
                size='lg'
                className='text-typography-600'
              />
              <Text className='text-typography-600'>Pin</Text>
            </Pressable>

            <Pressable
              className='gap-3 flex-row items-center hover:bg-background-50 p-3 rounded-md opacity-50'
              disabled
            >
              <Icon
                as={SettingsIcon}
                size='lg'
                className='text-typography-600'
              />
              <Text className='text-typography-600'>Settings</Text>
            </Pressable>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
