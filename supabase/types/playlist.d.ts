// types.ts - Mettre à jour les types
export type CreatePlaylistPayload = {
  title: string;
  description?: string;
  cover_url?: string;
  is_private?: boolean;
  is_collaborative?: boolean;
};

export type UpdatePlaylistPayload = Partial<CreatePlaylistPayload>;

export type PlaylistResponse = {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  owner_id: string;
  is_private: boolean;
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
};
