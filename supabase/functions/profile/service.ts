import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';
import { formatDbError } from '../../utils/postgres_errors_map.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
console.log('check SUPABASE_URL', Deno.env.get('SUPABASE_URL'));
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export async function getUserProfile(
  userId: string
): Promise<{ data: any; error: any }> {
  try {
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      const pgError = formatDbError(profileError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
    // Get follows data for display
    const followsRes = await getUserFollows(userId);

    const res = {
      profile: profile,
      followers: followsRes.data?.followers || [],
      following: followsRes.data?.following || [],
    };
    return { data: res, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Get user's profile with follow relationships (for other users)
export async function getUserProfileWithFollows(
  targetUserId: string,
  currentUserId: string
): Promise<{ data: any; error: any }> {
  try {
    // Get the target user's profile
    const profileRes = await getUserProfile(targetUserId);
    if (profileRes.error) {
      return profileRes;
    }

    // Get the target user's followers and following
    const followsData = await getUserFollows(targetUserId, currentUserId);
    if (followsData.error) {
      console.error('Error fetching user follows:', followsData.error);
      return {
        data: {
          profile: profileRes.data,
          is_following: false,
          is_follower: false,
          is_friend: false,
          followers: [],
          following: [],
        },
        error: null,
      };
    }

    // Extract relationship status from the follows data
    const followers = followsData.data?.followers || [];
    const following = followsData.data?.following || [];

    // Find the current user in the followers/following lists to determine relationships
    let isFollowing = false;
    // is_following: true if current user is following the target user (i.e., target user's id is in current user's following list)
    // is_follower: true if current user is followed by the target user (i.e., target user's id is in current user's followers list)
    let is_following = followers.some((f) => f.id === currentUserId);
    let is_follower = following.some((f) => f.id === currentUserId);

    return {
      data: {
        profile: profileRes.data.profile,
        is_following,
        is_follower,
        is_friend: is_following && is_follower,
        followers,
        following,
      },
      error: null,
    };
  } catch (error) {
    console.error(
      'Unexpected error fetching user profile with follows:',
      error
    );
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
    const pgError = formatDbError(followersResult.error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (followingResult.error) {
    console.error('Error fetching following:', followingResult.error);
    const pgError = formatDbError(followingResult.error);
    throw new HTTPException(pgError.status, { message: pgError.message });
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

    return { data: { followers, following } };
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
    const pgError = formatDbError(currentUserFollowsResult.error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (currentUserFollowersResult.error) {
    console.error(
      'Error fetching current user followers:',
      currentUserFollowersResult.error
    );
    const pgError = formatDbError(currentUserFollowersResult.error);
    throw new HTTPException(pgError.status, { message: pgError.message });
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

  return { data: { followers, following } };
}

// Follow a user
export async function followUserById(
  followerId: string,
  followingId: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  });

  if (error) {
    console.error('Error following user:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return { data: { success: true } };
}

// Unfollow a user
export async function unfollowUserById(
  followerId: string,
  followingId: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return { data: { success: true } };
}

// Search users
export async function searchUsersByQuery(
  currentUserId: string,
  query: string
): Promise<{ data: any[]; error: any }> {
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
    const pgError = formatDbError(profilesError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  // Get follow relationships for these users
  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('follower_id, following_id')
    .or(`follower_id.eq.${currentUserId},following_id.eq.${currentUserId}`);

  if (followsError) {
    console.error('Error fetching follow relationships:', followsError);
    const pgError = formatDbError(followsError);
    throw new HTTPException(pgError.status, { message: pgError.message });
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

  return { data: searchResults };
}
