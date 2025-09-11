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
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from '@/components/ui/menu';
import { Badge, BadgeText } from '@/components/ui/badge';
import { HStack } from '@/components/ui/hstack';

interface Props {
  callDelete: () => void;
  callEdit: () => void;
}

export default function Event3DotMenu({ callDelete, callEdit }: Props) {
  return (
    <Menu
      placement='bottom right'
      offset={5}
      disabledKeys={['Settings']}
      trigger={({ ...triggerProps }) => {
        return (
          <Button
            size='sm'
            action='secondary'
            variant='solid'
            className='rounded-2xl'
            {...triggerProps}
          >
            <Icon as={ThreeDotsIcon} size='md' />
          </Button>
        );
      }}
    >
      <MenuItem key='delete' textValue='delete' onPress={callDelete}>
        <Icon as={TrashIcon} size='sm' className='mr-2 color-red-500' />
        <MenuItemLabel className=' color-red-500' size='sm'>
          delete
        </MenuItemLabel>
      </MenuItem>
      <MenuItem
        key='edit'
        textValue='edit'
        onPress={callEdit}
        className='p-2 justify-between'
      >
        <HStack>
          <Icon as={EditIcon} size='sm' className='mr-2' />
          <MenuItemLabel className='mr-2' size='sm'>
            edit
          </MenuItemLabel>
        </HStack>
        <Badge action='warning' className='rounded-full'>
          <BadgeText className='text-2xs capitalize'>Not impl.</BadgeText>
        </Badge>
      </MenuItem>

      {/* MOCK MENU */}
      <MenuSeparator />
      <MenuItem
        key='share'
        disabled={true}
        textValue='Share'
        className='p-2 justify-between'
      >
        <HStack>
          <Icon as={GlobeIcon} size='sm' className='mr-2 color-secondary-700' />
          <MenuItemLabel size='sm' className='color-secondary-700'>
            Share
          </MenuItemLabel>
        </HStack>
        <Badge action='success' className='rounded-full'>
          <BadgeText className='text-2xs capitalize'>Coming soon</BadgeText>
        </Badge>
      </MenuItem>
      <MenuItem key='pin' disabled={true} textValue='Pin'>
        <Icon
          as={PaperclipIcon}
          size='sm'
          className='mr-2 color-secondary-700'
        />
        <MenuItemLabel size='sm' className='color-secondary-700'>
          Pin
        </MenuItemLabel>
      </MenuItem>
      <MenuItem key='settings' disabled={true} textValue='Settings'>
        <Icon
          as={SettingsIcon}
          size='sm'
          className='mr-2 color-secondary-700'
        />
        <MenuItemLabel size='sm' className='color-secondary-700'>
          Settings
        </MenuItemLabel>
      </MenuItem>
    </Menu>
  );
}
