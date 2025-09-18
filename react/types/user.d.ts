// Privacy settings for profile visibility
type PrivacySetting = 'own' |'public' | 'friends' | 'private';

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
};
