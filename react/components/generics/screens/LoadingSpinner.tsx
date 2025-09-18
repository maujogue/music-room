import colors from 'tailwindcss/colors';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Center } from '@/components/ui/center';

interface Props {
  text: string;
}

export default function LoadingSpinner({ text = '' }: Props) {
  return (
    <Center className='flex-1'>
      <HStack space='md' className='items-center'>
        <Spinner size='large' color={colors.indigo[500]} />
        {text && (
          <Text size='md' className='capitalize'>
            {text}
          </Text>
        )}
      </HStack>
    </Center>
  );
}
