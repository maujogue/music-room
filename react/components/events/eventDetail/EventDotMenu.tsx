import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  ThreeDotsIcon,
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
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { useState } from 'react';

interface Props {
  callDelete: () => void;
  callEdit: () => void;
}

export default function Event3DotMenu({ callDelete, callEdit }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    callDelete();
    handleCloseDrawer();
  };

  const handleEdit = () => {
    callEdit();
    handleCloseDrawer();
  };

  return (
    <>
      <Button
        size='sm'
        action='secondary'
        variant='solid'
        className='rounded-2xl opacity-80'
        onPress={handleOpenDrawer}
      >
        <ButtonIcon as={ThreeDotsIcon} size='md' />
      </Button>

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer}>
        <DrawerBackdrop />
        <DrawerContent className='w-full max-h-[50vh]'>
          <DrawerHeader>
            <Text size='lg' className='font-semibold text-center'>
              Event Options
            </Text>
          </DrawerHeader>

          <DrawerBody className='gap-2'>
            <VStack className='gap-2'>
              {/* Delete Button */}
              <Button
                variant='link'
                action='negative'
                className='w-full justify-start'
                onPress={handleDelete}
              >
                <HStack className='items-center gap-3'>
                  <ButtonIcon as={TrashIcon} />
                  <ButtonText>Delete Event</ButtonText>
                </HStack>
              </Button>

              {/* Edit Button */}
              <Button
                variant='link'
                className='w-full justify-start'
                onPress={handleEdit}
              >
                <HStack className='items-center justify-between w-full'>
                  <HStack className='items-center gap-3'>
                    <ButtonIcon as={EditIcon} />
                    <ButtonText>Edit Event</ButtonText>
                  </HStack>
                </HStack>
              </Button>

              <Divider className='my-2' />

              {/* Disabled Options */}
              <Button
                variant='link'
                className='w-full justify-start opacity-50'
                disabled={true}
              >
                <HStack className='items-center justify-between w-full'>
                  <HStack className='items-center gap-3'>
                    <ButtonIcon as={GlobeIcon} />
                    <ButtonText>Share Event</ButtonText>
                  </HStack>
                  <Badge action='success' className='rounded-full'>
                    <BadgeText className='text-2xs'>Coming soon</BadgeText>
                  </Badge>
                </HStack>
              </Button>

              <Button
                variant='link'
                className='w-full justify-start opacity-50'
                disabled={true}
              >
                <HStack className='items-center gap-3'>
                  <ButtonIcon as={PaperclipIcon} />
                  <ButtonText>Pin Event</ButtonText>
                </HStack>
              </Button>

              <Button
                variant='link'
                className='w-full justify-start opacity-50'
                disabled={true}
              >
                <HStack className='items-center gap-3'>
                  <ButtonIcon as={SettingsIcon} />
                  <ButtonText>Event Settings</ButtonText>
                </HStack>
              </Button>

              {/* Cancel Button */}
              <Button
                variant='solid'
                action='secondary'
                className='w-full mt-4'
                onPress={handleCloseDrawer}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
