// types.ts - Mettre à jour les types
export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  cover_url?: string;
  is_private?: boolean;
  is_collaborative?: boolean;
};

export type UpdatePlaylistPayload = Partial<CreatePlaylistPayload>;

export interface PlaylistResponse {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  owner_id: string;
  is_private: boolean;
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
  is_spotify_sync?: boolean;
  spotify_id?: string;
  can_edit?: boolean;
};

export interface PlaylistRow {
			id: string;
			name: string;
			description: string;
			is_private: boolean;
			is_collaborative: boolean;
			cover_url: string | null;
			created_at: string;
			updated_at: string;
			owner_id: string;
			is_spotify_sync?: boolean;
			spotify_id?: string;
		}