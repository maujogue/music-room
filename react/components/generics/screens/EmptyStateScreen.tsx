import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { AddIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Box } from '@/components/ui/box';

type EmptyStateProps = {
  source: any;
  title?: string;
  subtitle?: string;
  text?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  testID?: string;
  compact?: boolean;
};

export default function EmptyState({
  source,
  title = 'No events yet',
  subtitle = 'Create your first event to see it here.',
  text = '',
  onPressCta,
  testID = 'empty-state',
  compact = false,
}: EmptyStateProps) {
  const vstackClass = compact
    ? 'absolute h-full gap-20 px-10 py-40'
    : 'absolute h-full justify-between px-10 py-40';

  return (
    <Center testID={testID}>
      <Image
        className='w-full h-full'
        source={source}
        alt='Empty state illustration'
        resizeMode='cover'
      />
      <VStack space='lg' className={vstackClass}>
        <VStack className='items-center' space='sm'>
          <Text size='6xl' className='text-center font-black mb-8 text-white'>
            {title}
          </Text>
          <Box className='bg-primary-500/70 rounded-3xl border border-neutral-300 p-4'>
            <Text size='2xl' className='text-center font-semibold text-white'>
              {subtitle}
            </Text>
            <Text size='md' className='text-center px-12 mt-4 text-white/80'>
              {text}
            </Text>
          </Box>
        </VStack>

        {onPressCta ? (
          <Box className='w-auto self-center bg-neutral-300/50 rounded-full border border-neutral-300 p-0.5'>
            <Button
              size='lg'
              className='rounded-full bg-primary-500/70 w-20 h-20 p-3.5'
              action='primary'
              onPress={onPressCta}
            >
              <ButtonIcon size='xl' className='w-10 h-10' as={AddIcon} />
            </Button>
          </Box>
        ) : null}
      </VStack>
    </Center>
  );
}
