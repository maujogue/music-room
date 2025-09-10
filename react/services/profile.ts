import { apiFetch } from '@/utils/apiFetch';

const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/profile`;
console.log('baseUrl:', baseUrl);
// Get current user's profile
export async function getProfile(): Promise<{ data: any; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/get-profile`);
    console.log('profile response:', response);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
}

// Update current user's profile
export async function updateProfile(
  updates: Partial<UserInfo>
): Promise<{ data: any; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/update-profile`, {
      method: 'PUT',
      body: updates,
    });

    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
}

// Get user's followers
export async function getFollowers(): Promise<{ data: any[]; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/followers`);
    return { data: response.data || [], error: null };
  } catch (error) {
    console.error('Error fetching followers:', error);
    return { data: [], error };
  }
}

// Get user's following
export async function getFollowing(): Promise<{ data: any[]; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/following`);
    return { data: response.data || [], error: null };
  } catch (error) {
    console.error('Error fetching following:', error);
    return { data: [], error };
  }
}

// Follow a user
export async function followUser(userId: string): Promise<{ error: any }> {
  try {
    await apiFetch(`${baseUrl}/follow/${userId}`, {
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
    await apiFetch(`${baseUrl}/follow/${userId}`, {
      method: 'DELETE',
    });
    return { error: null };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { error };
  }
}

// Search users
export async function searchUsers(
  query: string
): Promise<{ data: any[]; error: any }> {
  try {
    const response = await apiFetch(
      `${baseUrl}/search?q=${encodeURIComponent(query)}`
    );
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error searching users:', error);
    return { data: [], error };
  }
}
