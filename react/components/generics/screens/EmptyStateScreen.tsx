import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon } from '@/components/ui/button';
import { AddIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { ReactNode } from 'react';

type EmptyStateProps = {
  source?: any;
  title?: string;
  subtitle?: string;
  text?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  testID?: string;
  compact?: boolean;
  addedCTA?: ReactNode;
};

export default function EmptyState({
  source,
  title = 'No events yet',
  subtitle = 'Create your first event to see it here.',
  text = '',
  onPressCta,
  testID = 'empty-state',
  compact = false,
  addedCTA,
}: EmptyStateProps) {
  const hasSource = !!source;
  const vstackClass = compact
    ? 'gap-20 px-10 py-40'
    : 'h-full justify-between px-10 py-40';

  return (
    <Center
      testID={testID}
      className={`flex-1 ${!hasSource ? 'bg-white' : ''}`}
    >
      {hasSource && (
        <Image
          className='w-full h-full absolute'
          source={source}
          alt='Empty state illustration'
          resizeMode='cover'
        />
      )}
      <VStack space='lg' className={vstackClass}>
        <VStack className='items-center' space='sm'>
          <Text
            size='6xl'
            className={`text-center font-black mb-8 ${
              hasSource ? 'text-white' : 'text-black'
            }`}
          >
            {title}
          </Text>
          <Box
            className={`${
              hasSource
                ? 'bg-primary-500/70 border-neutral-300'
                : 'bg-transparent border-transparent'
            } rounded-3xl border p-4`}
          >
            <Text
              size='2xl'
              className={`text-center font-semibold ${
                hasSource ? 'text-white' : 'text-black'
              }`}
            >
              {subtitle}
            </Text>
            <Text
              size='md'
              className={`text-center px-12 mt-4 ${
                hasSource ? 'text-white/80' : 'text-gray-500'
              }`}
            >
              {text}
            </Text>
          </Box>
        </VStack>
        {onPressCta ? (
          <HStack className='gap-8 justify-center w-full'>
            <Box className='bg-neutral-300/50 rounded-full border border-neutral-300 p-0.5'>
              <Button
                size='lg'
                className='rounded-full bg-primary-500/70 w-20 h-20 p-3.5'
                action='primary'
                onPress={onPressCta}
              >
                <ButtonIcon size='xl' className='w-10 h-10' as={AddIcon} />
              </Button>
            </Box>
            {addedCTA && (
              <Box className='bg-neutral-300/50 rounded-full border border-neutral-300 p-0.5'>
                {addedCTA}
              </Box>
            )}
          </HStack>
        ) : null}
      </VStack>
    </Center>
  );
}
