import { apiFetch } from '@/utils/apiFetch';

const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

export async function getCurrentUserProfile(): Promise<UserProfileWithFollows> {
  const res = await apiFetch<UserProfileWithFollows>(`${baseUrl}/me/profile`);
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}

export async function getUserProfile(
  userId: string
): Promise<UserProfileWithFollows> {
  const res = await apiFetch<UserProfileWithFollows>(
    `${baseUrl}/profile/user/${userId}`
  );
  if (!res.success) {
    console.error('Error fetching user profile:', res.error);
    throw res.error;
  }
  console.log('Fetched user profile:', res.data);
  return res.data;
}

export async function updateProfile(
  updates: Partial<UserInfo>
): Promise<UserInfo> {
  const res = await apiFetch<UserInfo>(`${baseUrl}/profile/update`, {
    method: 'PUT',
    body: updates,
  });
  if (!res.success) {
    console.error('Error updating profile:', res.error);
    throw res.error;
  }
  console.log('Profile updated successfully:', res.data);
  return res.data;
}

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

export async function getUserFollows(
  userId: string
): Promise<UserFollows | null> {
  const response = await apiFetch<UserFollows>(
    `${baseUrl}/profile/follows/${userId}`
  );
  if (!response.success) {
    throw response.error;
  }
  return response.data;
}
