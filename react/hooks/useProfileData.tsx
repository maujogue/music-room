import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';
import { signInWithSpotify } from '@/services/auth';
import { getUserProfile, followUser, unfollowUser } from '@/services/profile';
import { PrivacySetting } from '@/types/user';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

export function useProfileData(userId: string) {
  const { user: currentUser, signOut } = useAuth();
  const {
    profile: ownProfile,
    updateProfile,
    followers,
    following,
    refreshProfile,
  } = useProfile();

  const [editProfile, setEditProfile] = useState(false);
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine variant and if it's own profile
  const isOwnProfile = userId === currentUser?.id;
  const variant: ProfileVariant = isOwnProfile
    ? 'own'
    : !otherUserData
      ? 'public'
      : otherUserData.profile?.privacy_setting === 'public'
        ? 'public'
        : otherUserData.profile?.privacy_setting === 'friends' &&
            otherUserData.is_friend
          ? 'friends'
          : 'private';

  // Use appropriate data source
  const profile = isOwnProfile ? ownProfile : otherUserData?.profile;
  const profileFollowers = isOwnProfile
    ? followers
    : otherUserData?.followers || [];
  const profileFollowing = isOwnProfile
    ? following
    : otherUserData?.following || [];

  // Permissions based on variant
  const permissions = {
    canViewProfile: variant !== 'private',
    canViewEmail:
      variant === 'own' ||
      (variant === 'public' && profile?.privacy_setting !== 'private'),
    canViewBio: variant !== 'private',
    canViewMusicGenre: variant !== 'private',
    canViewFollowers: variant !== 'private',
    canEdit: variant === 'own',
  };

  // Load other user's data
  const loadUserData = useCallback(async () => {
    if (isOwnProfile || !userId) return;

    setError(null);
    try {
      const data = await getUserProfile(userId);
      if (!data) {
        setError('User not found');
        return;
      }
      setOtherUserData(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    }
  }, [isOwnProfile, userId]);

  // Focus effect for refreshing
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        if (isOwnProfile) {
          await refreshProfile();
        } else {
          await loadUserData();
        }
      };
      refreshData();
    }, [isOwnProfile, userId])
  );

  // Initial load
  React.useEffect(() => {
    if (!isOwnProfile) {
      setIsLoading(true);
      loadUserData().finally(() => setIsLoading(false));
    }
  }, [userId, isOwnProfile]);

  // Action handlers
  const actions = {
    handleSpotifyConnect: useCallback(async () => {
      try {
        await signInWithSpotify();
      } catch (error) {
        console.error('Error during Spotify OAuth:', error);
      }
    }, []),

    handlePrivacyChange: useCallback(
      async (privacy: PrivacySetting) => {
        if (isOwnProfile) {
          await updateProfile({ privacy_setting: privacy });
        }
      },
      [isOwnProfile, updateProfile]
    ),

    handleFollowAction: useCallback(async () => {
      if (!profile || isOwnProfile) return;

      try {
        if (otherUserData?.is_following) {
          await unfollowUser(otherUserData.profile.id);
        } else {
          await followUser(otherUserData.profile.id);
        }
        await loadUserData();
      } catch (error) {
        console.error('Error with follow action:', error);
      }
    }, [profile, isOwnProfile, otherUserData, loadUserData]),

    handleEditToggle: useCallback(() => {
      setEditProfile(!editProfile);
    }, [editProfile]),

    handleAvatarUpload: useCallback(
      (url: string) => {
        if (isOwnProfile) {
          updateProfile({ avatar_url: url });
        }
      },
      [isOwnProfile, updateProfile]
    ),

    signOut,
  };

  return {
    // Core data
    profile,
    variant,
    isOwnProfile,
    editProfile,
    isLoading,
    error,
    profileFollowers,
    profileFollowing,
    currentUser,
    otherUserData,
    userId,

    // Permissions
    permissions,

    // Actions
    actions,
  };
}
