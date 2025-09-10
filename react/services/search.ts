import { getSession } from '@/services/session';

export async function searchApi(
  query: string,
  type: string,
  options?: { limit?: number; offset?: number }
) {
  const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/search`;
  const params = new URLSearchParams({
    q: query,
    type,
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.offset && { offset: options.offset.toString() }),
  });

  const session = await getSession();
  const token = session?.access_token;

  const data = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Response not ok');
      }
      return res.json();
    })
    .catch(err => {
      console.error('Error fetching search results:', err);
    });
  return data;
}
