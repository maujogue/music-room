import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
// Get user profile
export async function getProfile(
  userId: string
): Promise<{ data: any; error: any }> {
  console.log('getProfile called with userId:', userId);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: any
): Promise<{ data: any; error: any }> {
  try {
    console.log('updateUserProfile called with userId:', userId);
    console.log('updateUserProfile called with updates:', updates);

    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    console.log('Profile updated successfully:', data);

    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Get user's followers
export async function getUserFollowers(
  userId: string
): Promise<{ data: any[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        created_at,
        follower:profiles!follows_follower_id_fkey(
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching followers:', error);
      return { data: [], error };
    }

    const followers =
      data?.map((follow) => ({
        id: follow.follower.id,
        username: follow.follower.username,
        avatar_url: follow.follower.avatar_url,
        created_at: follow.created_at,
        is_follower: true,
        is_following: false,
        is_friend: false,
      })) || [];

    return { data: followers, error: null };
  } catch (error) {
    console.error('Unexpected error fetching followers:', error);
    return { data: [], error: { message: 'An unexpected error occurred' } };
  }
}

// Get user's following
export async function getUserFollowing(
  userId: string
): Promise<{ data: any[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        created_at,
        following:profiles!follows_following_id_fkey(
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching following:', error);
      return { data: [], error };
    }

    const following =
      data?.map((follow) => ({
        id: follow.following.id,
        username: follow.following.username,
        avatar_url: follow.following.avatar_url,
        created_at: follow.created_at,
        is_follower: false,
        is_following: true,
        is_friend: false,
      })) || [];

    return { data: following, error: null };
  } catch (error) {
    console.error('Unexpected error fetching following:', error);
    return { data: [], error: { message: 'An unexpected error occurred' } };
  }
}

// Follow a user
export async function followUserById(
  followerId: string,
  followingId: string
): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      console.error('Error following user:', error);
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Unexpected error following user:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Unfollow a user
export async function unfollowUserById(
  followerId: string,
  followingId: string
): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Unexpected error unfollowing user:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Search users
export async function searchUsersByQuery(
  currentUserId: string,
  query: string
): Promise<{ data: any[]; error: any }> {
  try {
    // Search for users by username or email
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        email,
        avatar_url,
        bio,
        music_genre
      `
      )
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', currentUserId) // Exclude current user
      .limit(20);

    if (profilesError) {
      console.error('Error searching users:', profilesError);
      return { data: [], error: profilesError };
    }

    // Get follow relationships for these users
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('follower_id, following_id')
      .or(`follower_id.eq.${currentUserId},following_id.eq.${currentUserId}`);

    if (followsError) {
      console.error('Error fetching follow relationships:', followsError);
      return { data: [], error: followsError };
    }

    // Create a map of relationships
    const followingSet = new Set(
      follows
        ?.filter((f) => f.follower_id === currentUserId)
        .map((f) => f.following_id) || []
    );
    const followersSet = new Set(
      follows
        ?.filter((f) => f.following_id === currentUserId)
        .map((f) => f.follower_id) || []
    );

    // Build search results with relationship info
    const searchResults =
      profiles?.map((profile) => ({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        music_genre: profile.music_genre,
        is_following: followingSet.has(profile.id),
        is_follower: followersSet.has(profile.id),
        is_friend: followingSet.has(profile.id) && followersSet.has(profile.id),
      })) || [];

    return { data: searchResults, error: null };
  } catch (error) {
    console.error('Unexpected error searching users:', error);
    return { data: [], error: { message: 'An unexpected error occurred' } };
  }
}

// Check if two users are friends (mutual follow)
export async function areUsersFriends(
  userId1: string,
  userId2: string
): Promise<{ data: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, following_id')
      .or(
        `and(follower_id.eq.${userId1},following_id.eq.${userId2}),and(follower_id.eq.${userId2},following_id.eq.${userId1})`
      );

    if (error) {
      console.error('Error checking friendship:', error);
      return { data: false, error };
    }

    // Check if both directions exist (mutual follow)
    const user1FollowsUser2 = data?.some(
      (f) => f.follower_id === userId1 && f.following_id === userId2
    );
    const user2FollowsUser1 = data?.some(
      (f) => f.follower_id === userId2 && f.following_id === userId1
    );

    const areFriends = user1FollowsUser2 && user2FollowsUser1;

    return { data: areFriends, error: null };
  } catch (error) {
    console.error('Unexpected error checking friendship:', error);
    return { data: false, error: { message: 'An unexpected error occurred' } };
  }
}
