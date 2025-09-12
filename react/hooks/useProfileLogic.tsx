import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';
import { connectToSpotify } from '@/services/auth';
import { getUserProfile, followUser, unfollowUser } from '@/services/profile';
import { PrivacySetting } from '@/types/user';
import { ProfileVariant } from '@/components/profile/Profile';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  music_genre?: string[];
  privacy_setting?: PrivacySetting;
  created_at: string;
}

interface ProfileData {
  profile: UserProfile | null;
  is_following: boolean;
  is_follower: boolean;
  is_friend: boolean;
  followers: any[];
  following: any[];
}

export function useProfileLogic(userId: string, variant: ProfileVariant, refreshVariant: () => void) {
  const { user: currentUser, signOut } = useAuth();
  const {
    profile: ownProfile,
    updateProfile,
    followers,
    following,
    refreshProfile,
  } = useProfile();

  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is the current user's own profile
  const isOwnProfile = variant === 'own' && userId === currentUser?.id;

  // Use own profile data or load other user's data
  const profile = isOwnProfile ? ownProfile : profileData?.profile;
  const profileFollowers = isOwnProfile ? followers : profileData?.followers || [];
  const profileFollowing = isOwnProfile ? following : profileData?.following || [];

  const loadUserProfile = useCallback(async () => {
    if (isOwnProfile || !userId || !currentUser) return;

    setError(null);

    try {
      const data = await getUserProfile(userId);

      if (!data) {
        setError('User not found');
        return;
      }

      setProfileData({
        profile: data.profile,
        is_following: data.is_following,
        is_follower: data.is_follower,
        is_friend: data.is_friend,
        followers: data.followers,
        following: data.following,
      });
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    }
  }, [isOwnProfile, userId, currentUser]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        if (isOwnProfile) {
          await refreshProfile();
        } else {
          await loadUserProfile();
        }
        refreshVariant();
      };

      refreshData();
    }, [isOwnProfile, userId]) // Supprimé refreshProfile, loadUserProfile et refreshVariant des dépendances
  );

  const handlePressOauthSpotify = useCallback(async () => {
    try {
      await connectToSpotify();
    } catch (error) {
      console.error('Error during Spotify OAuth:', error);
    }
  }, []);

  const handlePrivacyChange = useCallback(async (privacy: PrivacySetting) => {
    if (isOwnProfile) {
      await updateProfile({ privacy_setting: privacy });
    }
  }, [isOwnProfile, updateProfile]);

  const handleFollowAction = useCallback(async () => {
    if (!profile || isOwnProfile) return;

    try {
      if (profileData?.is_following) {
        await unfollowUser(profileData.profile.id);
      } else {
        await followUser(profileData.profile.id);
      }
      setIsRefreshingProfile(true);
      await refreshVariant();
      await loadUserProfile();
      setIsRefreshingProfile(false);
    } catch (error) {
      console.error('Error with follow action:', error);
    }
  }, [profile, isOwnProfile, profileData, refreshVariant, loadUserProfile]);

  const handleEditToggle = useCallback(() => {
    setEditProfile(!editProfile);
  }, [editProfile]);

  const handleAvatarUpload = useCallback((url: string) => {
    if (isOwnProfile) {
      console.log('Uploading avatar', url);
      updateProfile({ avatar_url: url });
    }
  }, [isOwnProfile, updateProfile]);

  // Initial load
  React.useEffect(() => {
    if (!isOwnProfile) {
      setIsLoading(true);
      loadUserProfile().finally(() => setIsLoading(false));
    }
  }, [userId, isOwnProfile]); // Supprimé loadUserProfile des dépendances

  // Determine what content to show based on variant
  const canViewProfile = variant !== 'private';
  const canViewEmail = variant === 'own' || (variant === 'public' && profile?.privacy_setting !== 'private');
  const canViewBio = canViewProfile;
  const canViewMusicGenre = canViewProfile;
  const canViewFollowers = canViewProfile;
  const canEdit = variant === 'own';

  return {
    // State
    profile,
    profileData,
    editProfile,
    isLoading,
    isRefreshingProfile,
    error,
    isOwnProfile,
    profileFollowers,
    profileFollowing,
    currentUser,

    // Permissions
    canViewProfile,
    canViewEmail,
    canViewBio,
    canViewMusicGenre,
    canViewFollowers,
    canEdit,

    // Handlers
    handlePressOauthSpotify,
    handlePrivacyChange,
    handleFollowAction,
    handleEditToggle,
    handleAvatarUpload,
    signOut,
  };
}
