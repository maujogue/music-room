import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, followUser, unfollowUser } from '@/services/profile';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

export function useProfileData(userId: string) {
  const { user: currentUser, signOut } = useAuth();
  const {
    profile: ownProfile,
    updateProfile,
    followers,
    following,
    refreshProfile,
    connectSpotify,
    connectGoogle,
  } = useProfile();

  const [editProfile, setEditProfile] = useState(false);

  // Determine variant and if it's own profile
  const isOwnProfile = userId === currentUser?.id;

  // Use Query for other user data
  const {
    data: otherUserData,
    isLoading: isOtherLoading,
    error: otherError,
    refetch: refetchOtherUser,
  } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId && !isOwnProfile,
  });

  const variant: ProfileVariant = isOwnProfile
    ? 'own'
    : !otherUserData
      ? 'public'
      : otherUserData.privacy_setting === 'public'
        ? 'public'
        : otherUserData.privacy_setting === 'friends' && otherUserData.is_friend
          ? 'friends'
          : 'private';

  // Use appropriate data source
  const profile = isOwnProfile ? ownProfile : otherUserData;
  const profileFollowers = isOwnProfile
    ? followers
    : otherUserData?.followers || [];
  const profileFollowing = isOwnProfile
    ? following
    : otherUserData?.following || [];

  const isLoading = isOwnProfile ? false : isOtherLoading;
  const error = isOwnProfile
    ? null
    : otherError
      ? 'Failed to load profile'
      : null;

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

  // Focus effect for refreshing
  useFocusEffect(
    useCallback(() => {
      if (isOwnProfile) {
        refreshProfile();
      } else {
        refetchOtherUser();
      }
    }, [isOwnProfile, userId, refreshProfile, refetchOtherUser])
  );

  // Action handlers
  const actions = {
    handleSpotifyConnect: useCallback(async () => {
      try {
        if (isOwnProfile) {
          // Use connectSpotify from context for own profile
          await connectSpotify();
          // Refresh profile after connection to update connection status
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error during Spotify OAuth:', error);
      }
    }, [isOwnProfile, connectSpotify, refreshProfile]),

    handleGoogleConnect: useCallback(async () => {
      try {
        if (isOwnProfile) {
          // Use connectGoogle from context for own profile
          await connectGoogle();
          // Refresh profile after connection to update connection status
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error during Google OAuth:', error);
      }
    }, [isOwnProfile, connectGoogle, refreshProfile]),

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
          await unfollowUser(otherUserData.id);
        } else {
          await followUser(otherUserData!.id);
        }
        await refetchOtherUser();
      } catch (error) {
        console.error('Error with follow action:', error);
      }
    }, [profile, isOwnProfile, otherUserData, refetchOtherUser]),

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
