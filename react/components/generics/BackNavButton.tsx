import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/ui/button';

export default function BackNavButton() {
  const router = useRouter();

  return (
    <Button
      size='lg'
      className='rounded-full w-10 h-10 p-1 bg-transparent'
      action='primary'
      onPress={() => router.back()}
    >
      <ButtonIcon
        size='xl'
        className='w-8 h-8 text-typography-950'
        as={ArrowLeft}
      />
    </Button>
  );
}
