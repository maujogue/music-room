-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT TRUE,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_collaborators table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS playlist_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'collaborator', -- 'owner', 'collaborator', 'viewer'
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    UNIQUE(playlist_id, user_id)
);

-- Create tracks table (for storing track metadata)
CREATE TABLE IF NOT EXISTS tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spotify_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_tracks table (many-to-many relationship with order)
CREATE TABLE IF NOT EXISTS playlist_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, track_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playlists_owner_id ON playlists(owner_id);
CREATE INDEX IF NOT EXISTS idx_playlists_is_private ON playlists(is_private);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at);

CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_playlist_id ON playlist_collaborators(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_user_id ON playlist_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_tracks_spotify_id ON tracks(spotify_id);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for playlists table
CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- RLS helper functions (bypass RLS with SECURITY DEFINER)
-- Check if a user is owner of a playlist
CREATE OR REPLACE FUNCTION is_playlist_owner(p_playlist_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM playlists WHERE id = p_playlist_id AND owner_id = p_user_id
  );
$$;

-- Check if a user is collaborator of a playlist
CREATE OR REPLACE FUNCTION is_playlist_collaborator(p_playlist_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM playlist_collaborators WHERE playlist_id = p_playlist_id AND user_id = p_user_id
  );
$$;

-- RLS Policies for playlists table
CREATE POLICY "playlists_select_policy"
    ON playlists FOR SELECT
    USING (
        is_private = false
        OR owner_id = auth.uid()
        OR is_playlist_collaborator(id, auth.uid())
    );

CREATE POLICY "playlists_insert_policy"
    ON playlists FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "playlists_update_policy"
    ON playlists FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "playlists_delete_policy"
    ON playlists FOR DELETE
    USING (owner_id = auth.uid());

-- RLS Policies for playlist_collaborators table
CREATE POLICY "pcollab_select_policy"
    ON playlist_collaborators FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_playlist_owner(playlist_id, auth.uid())
    );

CREATE POLICY "pcollab_manage_policy"
    ON playlist_collaborators FOR ALL
    USING (
        is_playlist_owner(playlist_id, auth.uid())
    );

-- RLS Policies for tracks table (public read, authenticated insert)
CREATE POLICY "tracks_select_policy"
    ON tracks FOR SELECT
    TO public
    USING (true);

CREATE POLICY "tracks_insert_policy"
    ON tracks FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for playlist_tracks table
CREATE POLICY "playlist_tracks_select_policy"
    ON playlist_tracks FOR SELECT
    USING (
        is_playlist_owner(playlist_id, auth.uid())
        OR is_playlist_collaborator(playlist_id, auth.uid())
        OR (playlist_id IN (
            SELECT id FROM playlists WHERE is_private = false
        ))
    );

CREATE POLICY "playlist_tracks_insert_policy"
    ON playlist_tracks FOR INSERT
    WITH CHECK (
        is_playlist_owner(playlist_id, auth.uid())
        OR (is_playlist_collaborator(playlist_id, auth.uid()) AND (
            SELECT is_collaborative FROM playlists WHERE id = playlist_id
        ) = true)
    );

CREATE POLICY "playlist_tracks_update_policy"
    ON playlist_tracks FOR UPDATE
    USING (
        is_playlist_owner(playlist_id, auth.uid())
        OR (is_playlist_collaborator(playlist_id, auth.uid()) AND (
            SELECT is_collaborative FROM playlists WHERE id = playlist_id
        ) = true)
    );

CREATE POLICY "playlist_tracks_delete_policy"
    ON playlist_tracks FOR DELETE
    USING (
        is_playlist_owner(playlist_id, auth.uid())
        OR (is_playlist_collaborator(playlist_id, auth.uid()) AND (
            SELECT is_collaborative FROM playlists WHERE id = playlist_id
        ) = true)
    );

-- Function to automatically add owner as collaborator
CREATE OR REPLACE FUNCTION add_owner_as_collaborator()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO playlist_collaborators (playlist_id, user_id, role, added_by)
    VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to add owner as collaborator when playlist is created
CREATE TRIGGER add_owner_as_collaborator_trigger
    AFTER INSERT ON playlists
    FOR EACH ROW
    EXECUTE FUNCTION add_owner_as_collaborator();
