import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Music4Icon, Music2Icon } from 'lucide-react-native';
import { Badge, BadgeIcon } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import React from 'react';

interface Props {
  title?: string;
  text?: string;
  actionButton?: React.ReactNode;
}

export default function InfoScreen({
  title = 'Information',
  text = 'No additional information available at this time.',
  actionButton,
}: Props) {
  return (
    <Center className='flex-1 p-24'>
      <Card className='items-center rounded-xl'>
        <HStack space='md' className='items-center mb-8'>
          <Badge size='sm' action={'info'} className='rounded-full h-6'>
            <BadgeIcon size='lg' as={Music4Icon} />
          </Badge>
          <Heading className='text-center'>
            {title}
          </Heading>
          <Badge size='sm' action={'info'} className='rounded-full h-6'>
            <BadgeIcon size='lg' as={Music2Icon} />
          </Badge>
        </HStack>
        <HStack space='md' className='items-start pb-8'>
          <VStack>
            <Text size='md' className='text-secondary-700'>
              {text}
            </Text>
          </VStack>
        </HStack>
        {actionButton}
      </Card>
    </Center>
  );
}
