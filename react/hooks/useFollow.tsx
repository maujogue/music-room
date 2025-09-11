import { useState, useEffect } from 'react';
import {
  followUser,
  unfollowUser,
  getUserFollows,
  searchUsers,
} from '@/services/profile';

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
      const result = await getUserFollows(userId);

      if (result.error) {
        setError(result.error.message);
        setFollowers([]);
        setFollowing([]);
      } else {
        setFollowers(result.data?.followers || []);
        setFollowing(result.data?.following || []);
      }
    } catch (err) {
      setError('An unexpected error occurred', err);
      setFollowers([]);
      setFollowing([]);
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
      setSearchError('An unexpected error occurred', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchResults,
    isSearching,
    searchError,
    search,
  };
}
