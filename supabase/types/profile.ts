export interface ProfileResponse {
    id: string;
    email: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    music_genre?: string;
}

export interface ProfileWithFollowInfo extends ProfileResponse {
    is_following: boolean;
    is_follower: boolean;
    is_friend: boolean;
}