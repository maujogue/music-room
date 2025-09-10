import { supabase } from './supabase';

// Follow a user
export async function followUser(userId: string): Promise<{ error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    const { error } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: userId,
    });

    if (error) {
      console.error('Error following user:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error following user:', error);
    return { error: { message: 'An unexpected error occurred' } };
  }
}

// Unfollow a user
export async function unfollowUser(userId: string): Promise<{ error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error unfollowing user:', error);
    return { error: { message: 'An unexpected error occurred' } };
  }
}

// Get user's followers
export async function getUserFollowers(userId: string): Promise<{
  data: any[] | null;
  error: any;
}> {
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
      return { data: null, error };
    }

    const followers =
      data?.map(follow => ({
        id: follow.follower.id,
        username: follow.follower.username,
        avatar_url: follow.follower.avatar_url,
        created_at: follow.created_at,
      })) || [];

    return { data: followers, error: null };
  } catch (error) {
    console.error('Unexpected error fetching followers:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Get user's following
export async function getUserFollowing(userId: string): Promise<{
  data: any[] | null;
  error: any;
}> {
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
      return { data: null, error };
    }

    const following =
      data?.map(follow => ({
        id: follow.following.id,
        username: follow.following.username,
        avatar_url: follow.following.avatar_url,
        created_at: follow.created_at,
      })) || [];

    return { data: following, error: null };
  } catch (error) {
    console.error('Unexpected error fetching following:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Search for users to follow
export async function searchUsers(query: string): Promise<{
  data: any[] | null;
  error: any;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

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
      .neq('id', user.id) // Exclude current user
      .limit(20);

    if (profilesError) {
      console.error('Error searching users:', profilesError);
      return { data: null, error: profilesError };
    }

    // Get follow relationships for these users
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('follower_id, following_id')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);

    if (followsError) {
      console.error('Error fetching follow relationships:', followsError);
      return { data: null, error: followsError };
    }

    // Create a map of relationships
    const followingSet = new Set(
      follows
        ?.filter(f => f.follower_id === user.id)
        .map(f => f.following_id) || []
    );
    const followersSet = new Set(
      follows
        ?.filter(f => f.following_id === user.id)
        .map(f => f.follower_id) || []
    );

    // Build search results with relationship info
    const searchResults =
      profiles?.map(profile => ({
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
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Check if two users are friends (mutual follow)
export async function areUsersFriends(
  userId1: string,
  userId2: string
): Promise<{
  data: boolean | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, following_id')
      .or(
        `and(follower_id.eq.${userId1},following_id.eq.${userId2}),and(follower_id.eq.${userId2},following_id.eq.${userId1})`
      );

    if (error) {
      console.error('Error checking friendship:', error);
      return { data: null, error };
    }

    // Check if both directions exist (mutual follow)
    const user1FollowsUser2 = data?.some(
      f => f.follower_id === userId1 && f.following_id === userId2
    );
    const user2FollowsUser1 = data?.some(
      f => f.follower_id === userId2 && f.following_id === userId1
    );

    const areFriends = user1FollowsUser2 && user2FollowsUser1;

    return { data: areFriends, error: null };
  } catch (error) {
    console.error('Unexpected error checking friendship:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
}
