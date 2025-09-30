import { apiFetch } from '@/utils/apiFetch';

export async function createEvent(payload: MusicEventPayload) {
  const res = await apiFetch<Event>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events`,
    {
      method: 'POST',
      body: payload,
    }
  );

  if (!res.success) {
    console.error('Error creating Event:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function getEventById(id: string) {
  const res = await apiFetch<MusicEventFetchResult>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`,
    {
      method: 'GET',
    }
  );

  if (!res.success) {
    console.error('Error fetching Event:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function getVotesEventById(id: string) {
  const res = await apiFetch<EventVote[]>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}/votes`,
    {
      method: 'GET',
    }
  );

  if (!res.success) {
    console.error("Error fetching Event's votes:", res.error);
    throw res.error;
  }
  return res.data;
}

export async function voteForTrack(eventId: string, trackId: string) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${eventId}/votes/${trackId}`,
    {
      method: 'PUT',
    }
  );

  if (!res.success) {
    console.error('Error voting track:', res.error);
    throw res.error;
  }
}

export async function deleteEventById(id: string) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`,
    {
      method: 'DELETE',
    }
  );

  console.log('deleteEventById', { id, res });
  if (!res.success) {
    console.error('Error deleting Event:', res.error);
    throw res.error;
  }
}

export async function getCurrentUserEvents() {
  const res = await apiFetch<Event[]>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/events`,
    {
      method: 'GET',
    }
  );

  if (!res.success) {
    console.error('Error fetching user Events:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function updateEvent(id: string, payload: MusicEventPayload) {
  console.log('Updating event with ID:', id, 'Payload:', payload);

  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`;

  const imageUri = (payload as any).image_url;
  const form = new FormData();

  form.append('name', payload.name ?? '');
  form.append('description', payload.description ?? '');
  form.append('playlist_id', payload.playlist_id ?? '');
  form.append('beginning_at', payload.beginning_at ?? '');
  form.append('ending_at', payload.ending_at ?? '');
  form.append('location', JSON.stringify((payload as any).location ?? {}));

  if (imageUri) {
    const uri = imageUri as string;
    const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

    form.append('image', { uri, name: fileName, type: mime } as any);
  }

  console.log('Form data prepared for update:', form);
  const res = await apiFetch<Event>(url, {
    method: 'PUT',
    body: form,
  });

  if (!res.success) {
    console.error('Error updating Event:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function addUserToEvent(eventId: string, userId: string)
{
  console.log('Implement addUserToEvent', { eventId, userId });
}

export async function removeUserFromEvent(eventId: string, userId: string)
{
  console.log('Implement removeUserFromEvent', { eventId, userId });
}

