import { apiFetch } from '@/utils/apiFetch';

export async function createEvent(payload: MusicEventPayload) {
  const form = createEventFormData(payload);

  const res = await apiFetch<Event>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events`,
    {
      method: 'POST',
      body: form,
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

export async function getEventsWithRadar(coord: Coordinates): Promise<EventRadarResult[]> {
  const res = await apiFetch<EventRadarResult[]>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/radar?lat=${coord.lat}&long=${coord.long}`,
    {
      method: 'GET',
    }
  );

  if (!res.success) {
    console.error(`Error fetching Events at position (${coord.lat}, ${coord.long})`, res.error);
    throw res.error;
  }
  console.log("🖐️ radars res:", res.data);
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
  const res = await apiFetch<MusicEventFetchResult[]>(
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
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${id}`;

  const imageUri = (payload as any)?.image_url;
  const isLocalFile =
    typeof imageUri === 'string' &&
    (imageUri.startsWith('file:') ||
      imageUri.startsWith('content:') ||
      imageUri.startsWith('/') ||
      imageUri.startsWith('data:'));

  if (isLocalFile) {
    const form = createEventFormData(payload);
    const res = await apiFetch<MusicEvent>(url, {
      method: 'PUT',
      body: form,
    });

    if (!res.success) {
      console.error('Error updating Event (form):', res.error);
      throw res.error;
    }
    return res.data;
  }

  const res = await apiFetch<MusicEvent>(url, {
    method: 'PUT',
    body: payload,
  });

  if (!res.success) {
    console.error('Error updating Event (json):', res.error);
    throw res.error;
  }
  return res.data;
}

function createEventFormData(payload: MusicEventPayload) {
  const imageUri = (payload as any).image_url;
  const form = new FormData();

  form.append('name', payload.name ?? '');
  form.append('description', payload.description ?? '');
  form.append('playlist_id', payload.playlist_id ?? '');
  form.append('beginning_at', payload.beginning_at ?? '');
  form.append('location', JSON.stringify((payload as any).location ?? {}));
  form.append('is_private', String((payload as any).is_private ?? false));
  form.append(
    'everyone_can_vote',
    String((payload as any).everyone_can_vote ?? true)
  );

  if (imageUri) {
    const uri = imageUri as string;
    const isLocalFile =
      typeof uri === 'string' &&
      (uri.startsWith('file:') ||
        uri.startsWith('content:') ||
        uri.startsWith('/') ||
        uri.startsWith('data:'));

    if (isLocalFile) {
      const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

      form.append('image', { uri, name: fileName, type: mime } as any);
    }
  }

  return form;
}

export async function addUserToEvent(
  eventId: string,
  userId: string,
  role: string
) {
  console.log('Adding user to event', { eventId, userId, role });
  const res = await apiFetch<{ message: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${eventId}/invite`,
    {
      method: 'POST',
      body: {
        user_id: userId,
        role: role,
      },
    }
  );
  if (!res.success) {
    console.error('Error inviting user to event:', res.error);
    throw res.error;
  }
  console.log('User invited successfully to event:', res.data);
  return res.data;
}

export async function removeUserFromEvent(eventId: string, userId: string) {
  const res = await apiFetch<{ message: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${eventId}/invite`,
    {
      method: 'DELETE',
      body: {
        user_id: userId,
      },
    }
  );
  if (!res.success) {
    console.error('Error removing user from event:', res.error);
    throw res.error;
  }
  console.log('User removed successfully from event:', res.data);
  return res.data;
}

export async function editUserInEvent(
  eventId: string,
  userId: string,
  role: 'inviter' | 'voter' | 'member' | 'collaborator'
) {
  console.log('Editing user in event', { eventId, userId, role });
  const res = await apiFetch<{ message: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/events/${eventId}/invite`,
    {
      method: 'PUT',
      body: {
        user_id: userId,
        role: role,
      },
    }
  );
  if (!res.success) {
    console.error('Error editing user in event:', res.error);
    throw res.error;
  }
  console.log('User edited successfully in event:', res.data);
  return res.data;
}
