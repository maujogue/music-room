import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import PurchasesUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

type ToastApi = {
	success: (args: {
		title: string;
		description: string;
		duration?: number;
	}) => void;
	error: (args: {
		title: string;
		description: string;
		duration?: number;
	}) => void;
};

type PresentPaywallParams = {
	isPremium: boolean;
	toast: ToastApi;
};

export async function presentPaywall({
	isPremium,
	toast,
}: PresentPaywallParams): Promise<void> {
	if (Platform.OS === 'web') {
		return;
	}

	try {
		if (isPremium) {
			await PurchasesUI.presentCustomerCenter();
			return;
		}

		const offerings = await Purchases.getOfferings();
		const defaultOffering = offerings.all?.default ?? offerings.current;
		const result = await PurchasesUI.presentPaywall({
			offering: defaultOffering ?? undefined,
		});

		if (result === PAYWALL_RESULT.PURCHASED) {
			toast.success({
				title: 'Welcome to Premium!',
				description: 'Your subscription is now active.',
				duration: 3000,
			});
		}
	} catch (error) {
		toast.error({
			title: 'Paywall Error',
			description: 'Unable to show the paywall. Please try again.',
			duration: 3000,
		});
	}
}
