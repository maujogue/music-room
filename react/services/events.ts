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
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`, {
    method: 'GET',
  })

  if (!res.success) {
    console.error('Error fetching Event:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function getVotesEventById(id: string) {
  const res = await apiFetch<EventVote[]>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}/votes`, {
    method: 'GET',
  })

  if (!res.success) {
    console.error("Error fetching Event's votes:", res.error);
    throw res.error;
  }
  return res.data;

}

export async function voteForTrack(eventId: string, trackId: string) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${eventId}/votes/${trackId}`, {
    method: 'PUT',
  })

  if (!res.success) {
    console.error('Error voting track:', res.error);
    throw res.error;
  }
}

export async function deleteEventById(id: string) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`, {
    method: 'DELETE',
  })

  console.log('deleteEventById', { id, res });
  if (!res.success) {
    console.error('Error deleting Event:', res.error);
    throw res.error;
  }
}

export async function getCurrentUserEvents() {
  const res = await apiFetch<MusicEvent[]>(
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
  const res = await apiFetch<Event>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`,
    {
      method: 'PUT',
      body: payload,
    }
  );

  if (!res.success) {
    console.error('Error updating Event:', res.error);
    throw res.error;
  }
  return res.data;
}
