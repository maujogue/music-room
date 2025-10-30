import React, { useState } from 'react';
import { Badge, BadgeText, Text, VStack, HStack, Pressable } from '@/components/ui';
import { Crown, CrownIcon } from 'lucide-react-native';
import { useSubscription } from '@/contexts/subscriptionCtx';
import PaywallModal from './PaywallModal';

interface SubscriptionBadgeProps {
  showMemberSince?: boolean;
}

export default function SubscriptionBadge({ showMemberSince = true }: SubscriptionBadgeProps) {
  const { subscription, isPremium, isLoading } = useSubscription();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Badge variant="outline" size="sm">
        <BadgeText>Loading...</BadgeText>
      </Badge>
    );
  }

  return (
    <>
      <Pressable onPress={() => setIsPaywallOpen(true)}>
        <Badge 
          variant="solid" 
          action={isPremium ? "success" : "warning"}
          size="sm"
        >
          <HStack space="xs" className="items-center">
            <CrownIcon 
              size={12} 
              color={isPremium ? "#10B981" : "#F59E0B"} 
            />
            <BadgeText>
              {isPremium ? 'Premium' : 'Free'}
            </BadgeText>
          </HStack>
        </Badge>
      </Pressable>

      {isPremium && subscription && showMemberSince && (
        <VStack space="xs" className="mt-1">
          <Text className="text-xs text-typography-500">
            Member since {formatDate(subscription.started_at)}
          </Text>
        </VStack>
      )}

      <PaywallModal 
        isOpen={isPaywallOpen} 
        onClose={() => setIsPaywallOpen(false)} 
      />
    </>
  );
}
