// Privacy settings for profile visibility
type PrivacySetting = 'own' | 'public' | 'friends' | 'private';

type FollowType = 'followers' | 'following';

// UserInfo is a dictionary containing user info
type UserInfo = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  music_genre?: string[];
  privacy_setting?: PrivacySetting;
  is_connected_to_spotify?: boolean;
};

interface FollowInfo {
  is_following: boolean;
  is_follower: boolean;
  is_friend: boolean;
  followers: any[];
  following: any[];
}

interface UserProfileWithFollows extends UserInfo {
  is_following: boolean;
  is_follower: boolean;
  is_friend: boolean;
  followers: any[];
  following: any[];
}