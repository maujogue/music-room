import { apiFetch } from '@/utils/apiFetch';

export async function getEventById(id: string) {
  const res = await apiFetch<MusicEvent>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`, {
    method: 'GET',
  })

  if (!res.success) {
		console.error('Error fetching Event:', res.error);
		throw res.error;
	}
	return res.data;
}

export async function deleteEventById(id: string) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`, {
    method: 'DELETE',
    })

  if (!res.success) {
		console.error('Error deleting Event:', res.error);
		throw res.error;
	}
}
