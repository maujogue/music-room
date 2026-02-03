export interface ProfilePayload {
  username?: string;
  avatar_url?: string;
  bio?: string;
  music_genre?: string;
  privacy_setting?: "public" | "friends" | "private";
  email?: string;
}

export interface ProfileResponse {
  id: string;
  email?: string;
  username: string;
  avatar_url?: string | undefined;
  bio?: string;
  music_genre?: string;
  is_connected_to_spotify?: boolean;
  followers?: ProfileResponse[];
  following?: ProfileResponse[];
}

export interface ProfileWithFollowInfo extends ProfileResponse {
  is_following: boolean;
  is_follower: boolean;
  is_friend: boolean;
}

export interface ProfileSupabaseResponse {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string | null;
  music_genre?: string | null;
  spotify_access_token?: string | null;
  spotify_refresh_token?: string | null;
  spotify_token_expires_at?: string | null;
}

export interface FollowingProfileRow {
  created_at: string;
  following: {
    id: any;
    username: any;
    avatar?: any | null;
  };
}

export interface ProfileRow {
  id: string;
  username: string;
  avatar_url?: string | null;
}

// row lorsque tu sélectionnes "follower:profiles!follows_follower_id_fkey(...)"
export interface FollowerRow {
  created_at: string;
  follower: ProfileRow[]; // PostgREST retourne un array de relations
}

// row lorsque tu sélectionnes "following:profiles!follows_following_id_fkey(...)"
export interface FollowingRow {
  created_at: string;
  following: ProfileRow[]; // idem, tableau
}

// utilitaire
export type FollowRow = FollowerRow | FollowingRow;
