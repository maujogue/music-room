import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { getCurrentUserSubscription, upgradeSubscription, cancelSubscription } from '@/services/subscription';
import { Subscription } from '@/types/subscription';

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  toggleSubscription: () => Promise<{ error: any }>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPremium = subscription !== null;

  const refreshSubscription = async () => {
    setIsLoading(true);
    try {
      const data = await getCurrentUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscription = async (): Promise<{ error: any }> => {
    setIsLoading(true);
    try {
      if (isPremium) {
        // Cancel subscription
        await cancelSubscription();
        setSubscription(null);
      } else {
        // Upgrade to premium
        const newSubscription = await upgradeSubscription();
        setSubscription(newSubscription);
      }
      return { error: null };
    } catch (error) {
      console.error('Error toggling subscription:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    isPremium,
    isLoading,
    toggleSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
