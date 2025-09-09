import { useState, useEffect } from 'react';
import {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  areUsersFriends,
} from '@/services/follow';

export function useFollow(userId?: string) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFollowData = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [followersResult, followingResult] = await Promise.all([
        getUserFollowers(userId),
        getUserFollowing(userId),
      ]);

      if (followersResult.error) {
        setError(followersResult.error.message);
      } else {
        setFollowers(followersResult.data || []);
      }

      if (followingResult.error) {
        setError(followingResult.error.message);
      } else {
        setFollowing(followingResult.data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    const { error } = await followUser(targetUserId);
    if (error) {
      setError(error.message);
      return false;
    }
    // Reload data to reflect changes
    await loadFollowData();
    return true;
  };

  const handleUnfollow = async (targetUserId: string) => {
    const { error } = await unfollowUser(targetUserId);
    if (error) {
      setError(error.message);
      return false;
    }
    // Reload data to reflect changes
    await loadFollowData();
    return true;
  };

  useEffect(() => {
    loadFollowData();
  }, [userId]);

  return {
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    isLoading,
    error,
    follow: handleFollow,
    unfollow: handleUnfollow,
    refresh: loadFollowData,
  };
}

export function useUserSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const { data, error } = await searchUsers(query);
      if (error) {
        setSearchError(error.message);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (err) {
      setSearchError('An unexpected error occurred');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    const { error } = await followUser(userId);
    if (error) {
      setSearchError(error.message);
      return false;
    }
    // Update search results to reflect the change
    setSearchResults(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, is_following: true } : user
      )
    );
    return true;
  };

  const handleUnfollowUser = async (userId: string) => {
    const { error } = await unfollowUser(userId);
    if (error) {
      setSearchError(error.message);
      return false;
    }
    // Update search results to reflect the change
    setSearchResults(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, is_following: false, is_friend: false }
          : user
      )
    );
    return true;
  };

  return {
    searchResults,
    isSearching,
    searchError,
    search,
    followUser: handleFollowUser,
    unfollowUser: handleUnfollowUser,
  };
}
