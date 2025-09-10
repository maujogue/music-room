import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { CloseIcon, Icon } from '@/components/ui/icon';

type Props = {
  routePath?: string;
};

export default function CancelButton({ routePath = '../' }: Props) {
  const router = useRouter();

  return (
    <Box>
      <Button
        size='sm'
        action='secondary'
        variant='solid'
        className='rounded-2xl'
        onPress={() => router.push(routePath)}
      >
        <Icon as={CloseIcon} size='md' />
      </Button>
    </Box>
  );
}
