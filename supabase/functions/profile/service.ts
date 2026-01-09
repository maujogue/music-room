import { createClient } from '@supabase/supabase-js';
import { HTTPException } from '@hono/http-exception';
import { formatDbError } from '@postgres/postgres_errors_map';
import type {
  ProfileResponse,
  ProfileWithFollowInfo,
  ProfileSupabaseResponse,
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
  let is_connected_to_spotify = !!profile.spotify_access_token;
  if (is_connected_to_spotify) {
    if (new Date(profile.spotify_token_expires_at) < new Date()) {
      is_connected_to_spotify = false;
    }
  }

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

  return res;
}

// Get user's profile with follow relationships (for other users)
export async function getUserProfileWithFollows(
  targetUserId: string,
  currentUserId: string
): Promise<ProfileWithFollowInfo> {
  const profileRes = await getUserProfile(targetUserId);
  if (!profileRes) {
    throw new HTTPException(404, { message: 'User profile not found' });
  }

  const followsData = await getUserFollows(targetUserId, currentUserId);
  if (!followsData) {
    return {
      ...profileRes,
      is_following: false,
      is_follower: false,
      is_friend: false,
      followers: [],
      following: [],
    };
  }
  const followers = followsData.followers || [];
  const following = followsData.following || [];

  const is_following = followers.some((f) => f.id === currentUserId);
  const is_follower = following.some((f) => f.id === currentUserId);

  return {
    ...profileRes,
    is_following,
    is_follower,
    is_friend: is_following && is_follower,
    followers,
    following,
  };
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  payload: any
): Promise<ProfileResponse> {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
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
    data
      ?.map((follow: any) => {
        return {
          id: follow.follower.id,
          username: follow.follower.username,
          avatar_url: follow.follower.avatar,
          created_at: follow.created_at,
          is_follower: false,
          is_following: false,
          is_friend: false,
        } as ProfileWithFollowInfo;
      })
      .filter(Boolean) as ProfileWithFollowInfo[] || [];

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
    data
      ?.map((follow: any) => {
        return {
          id: follow.following.id,
          username: follow.following.username,
          avatar_url: follow.following.avatar,
          created_at: follow.created_at,
          is_follower: false,
          is_following: false,
          is_friend: false,
        } as ProfileWithFollowInfo;
      })
      .filter(Boolean) as ProfileWithFollowInfo[] || [];

  return following;
}

// Follow a user
export async function followUserById(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  });

  if (error) {
    console.error('Error following user:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

// Unfollow a user
export async function unfollowUserById(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}
