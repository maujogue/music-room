import { apiFetch } from '@/utils/apiFetch';
import { Subscription } from '@/types/subscription';

export async function getCurrentUserSubscription() {
  const res = await apiFetch<Subscription | null>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/subscription`,
    {
      method: 'GET',
    }
  );
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}

export async function upgradeSubscription() {
  const res = await apiFetch<Subscription>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/subscription`,
    {
      method: 'POST',
    }
  );
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}

export async function cancelSubscription() {
  const res = await apiFetch<{ message: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/subscription`,
    {
      method: 'DELETE',
    }
  );
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}
