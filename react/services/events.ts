import { getSession } from '@/services/session'

export async function getEventById(id: string) {
  const session = await getSession();
  const data = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching event:', error);
      throw error;
    });
  return data;
}

export async function deleteEventById(id: string) {
  const session = await getSession();
  const data = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
      },
    })
    .then(async response => {
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Delete failed (status ${response.status}): ${errorBody}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error deleting vent:', error);
      throw error;
    });
  return data;
}
