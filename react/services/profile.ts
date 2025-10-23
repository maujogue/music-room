import { apiFetch } from '@/utils/apiFetch';

const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

// Get another user's profile with follow relationships
export async function getCurrentUserProfile(): Promise<UserProfileWithFollows> {
  const res = await apiFetch<UserProfileWithFollows>(
    `${baseUrl}/me/profile`
  );
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}

export async function getUserProfile(userId: string): Promise<UserProfileWithFollows> {
  const res = await apiFetch<UserProfileWithFollows>(`${baseUrl}/profile/user/${userId}`);
  if (!res.success) {
    console.error('Error fetching user profile:', res.error);
    throw res.error;
  }
  console.log('Fetched user profile:', res.data);
  return res.data;
}

// Update current user's profile
export async function updateProfile(
  updates: Partial<UserInfo>
): Promise<{ data: any; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/profile/update`, {
      method: 'PUT',
      body: updates,
    });

    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
}

// Follow a user
export async function followUser(userId: string): Promise<{ error: any }> {
  try {
    await apiFetch(`${baseUrl}/profile/follow/${userId}`, {
      method: 'POST',
    });
    return { error: null };
  } catch (error) {
    console.error('Error following user:', error);
    return { error };
  }
}

// Unfollow a user
export async function unfollowUser(userId: string): Promise<{ error: any }> {
  try {
    await apiFetch(`${baseUrl}/profile/follow/${userId}`, {
      method: 'DELETE',
    });
    return { error: null };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { error };
  }
}

export async function getUserFollows(userId: string): Promise<UserFollows | null> {
  const response = await apiFetch<UserFollows>(`${baseUrl}/profile/follows/${userId}`);
  if (!response.success) {
    throw response.error;
  }
  return response.data;
}

export async function getUserFollowers(
  userId: string
): Promise<{ data: any[] | null; error: any }> {
  try {
    const response = await getUserFollows(userId);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.followers || null, error: null };
  } catch (error) {
    console.error('Error fetching user followers:', error);
    return { data: null, error };
  }
}

export async function getUserFollowing(
  userId: string
): Promise<{ data: any[] | null; error: any }> {
  try {
    const response = await getUserFollows(userId);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.following || null, error: null };
  } catch (error) {
    console.error('Error fetching user following:', error);
    return { data: null, error };
  }
}
