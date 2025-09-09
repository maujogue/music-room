// Privacy settings for profile visibility
export type PrivacySetting = 'public' | 'friends' | 'private';

// UserInfo is a dictionary containing user info
export type UserInfo = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  music_genre?: string[];
  privacy_setting?: PrivacySetting;
};
