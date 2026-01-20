import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'MusicRoom Pro';

type PurchaseResult = {
  error: any | null;
  userCancelled?: boolean;
  customerInfo?: CustomerInfo;
};

type RestoreResult = {
  error: any | null;
  customerInfo?: CustomerInfo;
};

interface SubscriptionContextType {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isPremium: boolean;
  isLoading: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<RestoreResult>;
  refreshCustomerInfo: () => Promise<void>;
  refreshOfferings: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
}

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPremium =
    !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive;

  const refreshCustomerInfo = async () => {
    if (Platform.OS === 'web') {
      return;
    }
    setIsLoading(true);
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error fetching RevenueCat customer info:', error);
      setCustomerInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOfferings = async () => {
    if (Platform.OS === 'web') {
      return;
    }
    try {
      const data = await Purchases.getOfferings();
      setOfferings(data);
    } catch (error) {
      console.error('Error fetching RevenueCat offerings:', error);
      setOfferings(null);
    }
  };

  const purchasePackage = async (
    pkg: PurchasesPackage
  ): Promise<PurchaseResult> => {
    if (Platform.OS === 'web') {
      return { error: new Error('Purchases are not supported on web.') };
    }
    setIsLoading(true);
    try {
      const { customerInfo: updatedInfo } =
        await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);
      return { error: null, customerInfo: updatedInfo };
    } catch (error) {
      if (error?.userCancelled) {
        return { error: null, userCancelled: true };
      }
      console.error('Error purchasing package:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<RestoreResult> => {
    if (Platform.OS === 'web') {
      return { error: new Error('Restores are not supported on web.') };
    }
    setIsLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return { error: null, customerInfo: info };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    refreshCustomerInfo();
    refreshOfferings();

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const value: SubscriptionContextType = {
    customerInfo,
    offerings,
    isPremium,
    isLoading,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
    refreshOfferings,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
