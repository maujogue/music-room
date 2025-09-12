import { apiFetch } from '@/utils/apiFetch';
import { UserInfo } from '@/types/user';

const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/profile`;

// Get another user's profile with follow relationships
export async function getUserProfile(userId: string): Promise<{
  data: {
    profile: any;
    is_following: boolean;
    is_follower: boolean;
    is_friend: boolean;
    followers: any[];
    following: any[];
  } | null;
  error: any;
}> {
    const res = await apiFetch(`${baseUrl}/user/${userId}`);
    if (!res.success) {
      console.error('Error fetching user profile:', res.error);
      throw res.error;
    }
    return res.data;
}

// Update current user's profile
export async function updateProfile(
  updates: Partial<UserInfo>
): Promise<{ data: any; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/update`, {
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

// Get user's follows (both followers and following)
export async function getUserFollows(userId: string): Promise<{
  data: { followers: any[]; following: any[] } | null;
  error: any;
}> {
  try {
    const response = await apiFetch(`${baseUrl}/follows/${userId}`);
    return { data: response.data || null, error: null };
  } catch (error) {
    console.error('Error fetching user follows:', error);
    return { data: null, error };
  }
}

// Get user's followers by userId (convenience function)
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

// Get user's following by userId (convenience function)
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

// Search users
export async function searchUsers(
  query: string
): Promise<{ data: any[] | null; error: any }> {
  try {
    const response = await apiFetch(
      `${baseUrl}/search?q=${encodeURIComponent(query)}`
    );
    return { data: response.data || null, error: null };
  } catch (error) {
    console.error('Error searching users:', error);
    return { data: null, error };
  }
}

// Check if two users are friends
export async function areUsersFriends(
  userId1: string,
  userId2: string
): Promise<{ data: boolean | null; error: any }> {
  try {
    const response = await apiFetch(`${baseUrl}/friends/${userId1}/${userId2}`);
    return { data: response.areFriends || null, error: null };
  } catch (error) {
    console.error('Error checking friendship:', error);
    return { data: null, error };
  }
}
