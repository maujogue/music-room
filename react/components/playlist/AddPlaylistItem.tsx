import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon, AddIcon } from '@/components/ui/icon';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';

type Props = {
  onPress: () => void;
  title: string;
};

export default function AddPlaylistItem({ onPress, title }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Card
        size='md'
        className='rounded-lg h-[70px] w-100 mb-4 p-2'
        variant='elevated'
      >
        <HStack className='py-1 flex-1 justify-start items-center'>
          <Box className='rounded-md h-[60px] w-[60px] justify-center items-center'>
            <Icon as={AddIcon} size='xl' className='h-10 w-10' />
          </Box>
          <Text size='xl' className='font-semibold text-typography-800'>
            {title}
          </Text>
        </HStack>
      </Card>
    </Pressable>
  );
}
