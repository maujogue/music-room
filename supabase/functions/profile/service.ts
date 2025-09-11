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

// Get user's follows (both followers and following)
export async function getUserFollows(
  userId: string,
  currentUserId?: string
): Promise<{ data: { followers: any[]; following: any[] }; error: any }> {
  try {
    // Get both followers and following in parallel
    const [followersResult, followingResult] = await Promise.all([
      supabase
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
        .order('created_at', { ascending: false }),
      supabase
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
        .order('created_at', { ascending: false }),
    ]);

    if (followersResult.error) {
      console.error('Error fetching followers:', followersResult.error);
      return {
        data: { followers: [], following: [] },
        error: followersResult.error,
      };
    }

    if (followingResult.error) {
      console.error('Error fetching following:', followingResult.error);
      return {
        data: { followers: [], following: [] },
        error: followingResult.error,
      };
    }

    // If no current user, return basic info
    if (!currentUserId) {
      const followers =
        followersResult.data?.map((follow) => ({
          id: follow.follower.id,
          username: follow.follower.username,
          avatar_url: follow.follower.avatar_url,
          created_at: follow.created_at,
          is_follower: false,
          is_following: false,
          is_friend: false,
        })) || [];

      const following =
        followingResult.data?.map((follow) => ({
          id: follow.following.id,
          username: follow.following.username,
          avatar_url: follow.following.avatar_url,
          created_at: follow.created_at,
          is_follower: false,
          is_following: false,
          is_friend: false,
        })) || [];

      return { data: { followers, following }, error: null };
    }

    // Get current user's follow relationships (both following and followers)
    const [currentUserFollowsResult, currentUserFollowersResult] =
      await Promise.all([
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId),
        supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', currentUserId),
      ]);

    if (currentUserFollowsResult.error) {
      console.error(
        'Error fetching current user follows:',
        currentUserFollowsResult.error
      );
      return {
        data: { followers: [], following: [] },
        error: currentUserFollowsResult.error,
      };
    }

    if (currentUserFollowersResult.error) {
      console.error(
        'Error fetching current user followers:',
        currentUserFollowersResult.error
      );
      return {
        data: { followers: [], following: [] },
        error: currentUserFollowersResult.error,
      };
    }

    const followingSet = new Set(
      currentUserFollowsResult.data?.map((f) => f.following_id) || []
    );
    const followersSet = new Set(
      currentUserFollowersResult.data?.map((f) => f.follower_id) || []
    );

    // Process followers
    const followers =
      followersResult.data?.map((follow) => {
        const followerId = follow.follower.id;
        const isFollowing = followingSet.has(followerId);
        const isFollower = followersSet.has(followerId);

        return {
          id: followerId,
          username: follow.follower.username,
          avatar_url: follow.follower.avatar_url,
          created_at: follow.created_at,
          is_follower: isFollower, // This user follows the current user
          is_following: isFollowing, // Current user follows this follower
          is_friend: isFollowing && isFollower, // Mutual follow
        };
      }) || [];

    // Process following
    const following =
      followingResult.data?.map((follow) => {
        const followingId = follow.following.id;
        const isFollowing = followingSet.has(followingId);
        const isFollower = followersSet.has(followingId);

        return {
          id: followingId,
          username: follow.following.username,
          avatar_url: follow.following.avatar_url,
          created_at: follow.created_at,
          is_follower: isFollower, // This user follows the current user
          is_following: isFollowing, // Current user follows this user
          is_friend: isFollowing && isFollower, // Mutual follow
        };
      }) || [];

    return { data: { followers, following }, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user follows:', error);
    return {
      data: { followers: [], following: [] },
      error: { message: 'An unexpected error occurred' },
    };
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
