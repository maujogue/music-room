import FloatButton from '@/components/generics/FloatButton';
import {
  ThreeDotsIcon,
  Icon,
  TrashIcon,
  EditIcon,
  LockIcon,
  SettingsIcon,
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
import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { getRandomImage } from '@/utils/randomImage';

interface Props {
  playlist: Playlist;
  callDelete: () => void;
  callEdit: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  className?: string;
  style?: any;
}

export default function Playlist3DotMenu({
  playlist,
  callDelete,
  callEdit,
  isPremium = true,
  onUpgrade,
  className,
  style,
}: Props) {
  const imageSource = playlist?.cover_url
    ? { uri: playlist.cover_url }
    : getRandomImage();
  const [showDrawer, setShowDrawer] = useState(false);

  const handleClose = () => setShowDrawer(false);

  if (playlist.user.role !== 'owner') return null;

  return (
    <>
      <FloatButton
        onPress={() => setShowDrawer(true)}
        icon={SettingsIcon}
        className={className}
        style={style}
      />

      <Drawer isOpen={showDrawer} onClose={handleClose}>
        <DrawerBackdrop />
        <DrawerContent className='w-[270px] md:w-[300px]'>
          <DrawerHeader>
            <HStack className='gap-3 items-center'>
              <Image
                source={imageSource}
                className='w-20 h-20 aspect-square '
                alt='Playlist image'
              />
              <Text size='4xl' className='font-semibold'>
                {playlist?.name}
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody contentContainerClassName='gap-2'>
            {isPremium ? (
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
            ) : (
              <Pressable
                className='gap-3 flex-row items-center justify-between hover:bg-background-50 p-3 rounded-md opacity-75'
                onPress={() => {
                  handleClose();
                  onUpgrade?.();
                }}
              >
                <HStack className='gap-3 items-center'>
                  <Icon
                    as={LockIcon}
                    size='lg'
                    className='text-typography-400'
                  />
                  <Text className='text-typography-400'>Delete</Text>
                </HStack>
                <Badge action='warning' className='rounded-full'>
                  <BadgeText className='text-2xs'>Premium</BadgeText>
                </Badge>
              </Pressable>
            )}

            {isPremium ? (
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
            ) : (
              <Pressable
                className='gap-3 flex-row items-center justify-between hover:bg-background-50 p-3 rounded-md opacity-75'
                onPress={() => {
                  handleClose();
                  onUpgrade?.();
                }}
              >
                <HStack className='gap-3 items-center'>
                  <Icon
                    as={LockIcon}
                    size='lg'
                    className='text-typography-400'
                  />
                  <Text className='text-typography-400'>Edit</Text>
                </HStack>
                <Badge action='warning' className='rounded-full'>
                  <BadgeText className='text-2xs'>Premium</BadgeText>
                </Badge>
              </Pressable>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
