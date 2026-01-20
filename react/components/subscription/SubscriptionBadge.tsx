import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeText } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from 'react-native';
import { Icon, StarIcon, InfoIcon } from '@/components/ui/icon';
import { useSubscription } from '@/contexts/subscriptionCtx';
import { useAppToast } from '@/hooks/useAppToast';
import { presentPaywall } from '@/components/subscription/PaywallModal';

interface SubscriptionBadgeProps {
  showMemberSince?: boolean;
}

export default function SubscriptionBadge({
  showMemberSince = true,
}: SubscriptionBadgeProps) {
  const { customerInfo, isPremium, isLoading } = useSubscription();
  const toast = useAppToast();

  const entitlement = customerInfo?.entitlements?.active?.['MusicRoom Pro'];
  const memberSince = entitlement?.latestPurchaseDate;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    // Left aligned loading badge
    return (
      <VStack className='px-3' style={{ alignSelf: 'flex-start' }}>
        <Badge variant='outline' size='sm'>
          <BadgeText>Loading...</BadgeText>
        </Badge>
      </VStack>
    );
  }

  return (
    <VStack className='px-3' style={{ alignItems: 'flex-end' }}>
      <HStack className='items-center w-full justify-end'>
        {isPremium && memberSince && showMemberSince ? (
          <Text className='text-xs text-typography-500 mr-2'>
            Since {formatDate(memberSince)}
          </Text>
        ) : (
          <Text style={{ minWidth: 80 }}> </Text>
        )}
        <Pressable
          onPress={() => {
            void presentPaywall({ isPremium, toast });
          }}
        >
          <Badge
            variant='solid'
            action={isPremium ? 'success' : 'warning'}
            size='lg'
          >
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
      </HStack>
    </VStack>
  );
}
