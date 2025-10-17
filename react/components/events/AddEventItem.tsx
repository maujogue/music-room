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

export default function AddEventItem({ onPress, title }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Card
        size='md'
        className='rounded-xl h-[100px] w-100 bg-background-800'
        variant='elevated'
      >
        <HStack className='py-1 flex-1 justify-start items-center gap-4'>
          <Box className='rounded-md h-[60px] w-[60px] justify-center items-center'>
            <Icon as={AddIcon} size='xl' color='white' />
          </Box>
          <Text size='2xl' className='text-white'>
            {title}
          </Text>
        </HStack>
      </Card>
    </Pressable>
  );
}
