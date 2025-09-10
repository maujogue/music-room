import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { AddIcon, Icon } from '@/components/ui/icon';

interface Props {
  routePath: string;
}

export default function NewItemButton({ routePath }: Props) {
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
        <Icon as={AddIcon} size='md' />
      </Button>
    </Box>
  );
}
