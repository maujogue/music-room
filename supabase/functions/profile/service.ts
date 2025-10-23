import { createClient } from '@supabase/supabase-js';
import { HTTPException } from '@hono/http-exception';
import { formatDbError } from '@postgres/postgres_errors_map';
import type { 
  ProfileResponse, 
  ProfileWithFollowInfo, 
  ProfileRow, 
  FollowerRow, 
  FollowRow, 
  FollowingRow,
  ProfileSupabaseResponse
} from '@profile';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
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
): Promise<ProfileResponse> {
  console.log('getUserProfile called with userId:', userId);
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

  const { followers, following } = await getUserFollows(userId);
  console.log('Fetched followers and following for userId:', userId);
  let is_connected_to_spotify = !!profile.spotify_access_token;
  if (is_connected_to_spotify) {
    if (new Date(profile.spotify_token_expires_at) < new Date()) {
      is_connected_to_spotify = false;
    }
  }

  console.log('is_connected_to_spotify for userId', userId, ':', is_connected_to_spotify);
  const {
    spotify_access_token: _sat,
    spotify_refresh_token: _srt,
    spotify_token_expires_at: _stea,
    ...profileWithoutSpotify
  } = profile as ProfileSupabaseResponse;

  const res: ProfileResponse = {
    ...profileWithoutSpotify,
    is_connected_to_spotify,
    followers: followers || [],
    following: following || [],
  };

  console.log('getUserProfile res:', res);
  return res;
}

// Get user's profile with follow relationships (for other users)
export async function getUserProfileWithFollows(
  targetUserId: string,
  currentUserId: string
): Promise<ProfileWithFollowInfo> {
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

export async function getUserFollows(
  userId: string,
  currentUserId?: string
): Promise<{ followers: ProfileResponse[]; following: ProfileResponse[] }> {
  const followers = await getUserFollowers(userId); 
  const following = await getUserFollowing(userId);

  if (!currentUserId) {
    return { followers, following };
  }

  const { followingSet, followersSet } = await getUserRelationships(currentUserId);

  followers.map((follow) => {
      const followerId = follow.id;
      const isFollowing = followingSet.has(followerId);
      const isFollower = followersSet.has(followerId);

      return {
        id: followerId,
        username: follow.username,
        avatar_url: follow.avatar_url,
        created_at: follow,
        is_follower: isFollower,
        is_following: isFollowing,
        is_friend: isFollowing && isFollower,
      };
    }) || [];

  following.map((follow) => {
      const followingId = follow.id;
      const isFollowing = followingSet.has(followingId);
      const isFollower = followersSet.has(followingId);

      return {
        id: followingId,
        username: follow.username,
        avatar_url: follow.avatar_url,
        is_follower: isFollower,
        is_following: isFollowing,
        is_friend: isFollowing && isFollower,
      };
    }) || [];

  return { followers, following };
}

async function getUserRelationships(userId: string): Promise<{ followingSet: Set<string>; followersSet: Set<string> }> {
    const [currentUserFollowsResult, currentUserFollowersResult] =
    await Promise.all([
      supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId),
      supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId),
    ]);

  if (currentUserFollowsResult.error) {
    const pgError = formatDbError(currentUserFollowsResult.error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (currentUserFollowersResult.error) {
    const pgError = formatDbError(currentUserFollowersResult.error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  const followingSet: Set<string> = new Set(
    currentUserFollowsResult.data?.map((f: { following_id: string }) => f.following_id) || []
  );
  const followersSet: Set<string> = new Set(
    currentUserFollowersResult.data?.map((f: { follower_id: string }) => f.follower_id) || []
  );

  return { followingSet, followersSet };
}

async function getUserFollowers(userId: string): Promise<ProfileWithFollowInfo[]> {
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
      .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching followers:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  const followers: ProfileWithFollowInfo[] =
    data?.map((follow: FollowerRow) => ({
      id: follow.follower[0].id,
      username: follow.follower[0].username,
      avatar_url: follow.follower[0].avatar_url,
      created_at: follow.created_at,
      is_follower: false,
      is_following: false,
      is_friend: false,
    })) || [];

  return followers;
}

async function getUserFollowing(userId: string): Promise<ProfileWithFollowInfo[]> {
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
      .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching following:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  const following: ProfileWithFollowInfo[] =
    data?.map((follow: FollowingRow) => ({
      id: follow.following[0].id,
      username: follow.following[0].username,
      avatar_url: follow.following[0].avatar_url,
      created_at: follow.created_at,
      is_follower: false,
      is_following: false,
      is_friend: false,
    })) || [];

  return following;
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
