import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeText } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from 'react-native';
import { Icon, StarIcon, InfoIcon } from '@/components/ui/icon';
import { useSubscription } from '@/contexts/subscriptionCtx';
import PaywallModal from './PaywallModal';

interface SubscriptionBadgeProps {
  showMemberSince?: boolean;
}

export default function SubscriptionBadge({
  showMemberSince = true,
}: SubscriptionBadgeProps) {
  const { subscription, isPremium, isLoading } = useSubscription();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <VStack className='px-3' style={{ alignSelf: 'flex-end' }}>
        <Badge variant='outline' size='sm'>
          <BadgeText>Loading...</BadgeText>
        </Badge>
      </VStack>
    );
  }

  return (
    <VStack className='px-3'>
      <HStack className='w-full items-center'>
        <VStack style={{ flex: 1 }} />
        <VStack>
          <Pressable onPress={() => setIsPaywallOpen(true)}>
            <Badge variant='solid' action={isPremium ? 'success' : 'warning'} size='lg'>
              <HStack space='xs' className='items-center'>
                <Icon
                  as={isPremium ? StarIcon : InfoIcon}
                  size='sm'
                  color={isPremium ? '#10B981' : '#F59E0B'}
                />
                <BadgeText>{isPremium ? 'Premium' : 'Free'}</BadgeText>
              </HStack>
            </Badge>
          </Pressable>
          {isPremium && subscription && showMemberSince && (
            <Text
              className='text-xs text-typography-500'
              style={{ marginTop: 4, marginRight: 0, alignSelf: 'flex-end' }}
            >
              since {formatDate(subscription.started_at)}
            </Text>
          )}
        </VStack>
      </HStack>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </VStack>
  );
}
