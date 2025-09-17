-- Create playlists table
CREATE TABLE
IF NOT EXISTS playlists
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    name VARCHAR
(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE,
    is_private BOOLEAN
DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT TRUE,
    cover_url TEXT,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    is_spotify_sync BOOLEAN DEFAULT FALSE,
    spotify_id TEXT UNIQUE
);

-- Create playlist_collaborators table (many-to-many relationship)
CREATE TABLE
IF NOT EXISTS playlist_collaborators
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists
(id) ON
DELETE CASCADE,
    user_id UUID
NOT NULL REFERENCES auth.users
(id) ON
DELETE CASCADE,
    role VARCHAR(50)
DEFAULT 'collaborator', -- 'owner', 'collaborator', 'viewer'
    added_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    added_by UUID REFERENCES auth.users
(id),
    UNIQUE
(playlist_id, user_id)
);

-- Create playlist_tracks table (many-to-many relationship with order)
CREATE TABLE
IF NOT EXISTS playlist_tracks
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists
(id) ON
DELETE CASCADE,
    track_id TEXT
NOT NULL,
    position INTEGER
NOT NULL DEFAULT 0,
    added_by UUID REFERENCES auth.users
(id),
    added_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    UNIQUE
(playlist_id, track_id)
);

-- Create playlist_members table (access to private playlists)
CREATE TABLE IF NOT EXISTS playlist_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    UNIQUE(playlist_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX
IF NOT EXISTS idx_playlists_owner_id ON playlists
(owner_id);
CREATE INDEX
IF NOT EXISTS idx_playlists_is_private ON playlists
(is_private);
CREATE INDEX
IF NOT EXISTS idx_playlists_created_at ON playlists
(created_at);

CREATE INDEX
IF NOT EXISTS idx_playlist_collaborators_playlist_id ON playlist_collaborators
(playlist_id);
CREATE INDEX
IF NOT EXISTS idx_playlist_collaborators_user_id ON playlist_collaborators
(user_id);

CREATE INDEX
IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks
(playlist_id);
CREATE INDEX
IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks
(track_id);
CREATE INDEX
IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks
(playlist_id, position);

CREATE INDEX IF NOT EXISTS idx_playlist_members_playlist_id ON playlist_members(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_members_user_id ON playlist_members(user_id);

-- Create index for spotify_id for better performance on sync operations
CREATE INDEX IF NOT EXISTS idx_playlists_spotify_id ON playlists(spotify_id);

-- Create unique constraint on spotify_id for upsert operations
ALTER TABLE playlists ADD CONSTRAINT unique_spotify_id UNIQUE (spotify_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for playlists table
CREATE TRIGGER update_playlists_updated_at
    BEFORE
UPDATE ON playlists
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable RLS (Row Level Security)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_members ENABLE ROW LEVEL SECURITY;

-- RLS helper functions (bypass RLS with SECURITY DEFINER)
-- Check if a user is owner of a playlist
CREATE OR REPLACE FUNCTION is_playlist_owner
(p_playlist_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS
(
    SELECT 1
FROM playlists
WHERE id = p_playlist_id AND owner_id = p_user_id
  );
$$;

-- Check if a user is collaborator of a playlist
CREATE OR REPLACE FUNCTION is_playlist_collaborator
(p_playlist_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS
(
    SELECT 1
FROM playlist_collaborators
WHERE playlist_id = p_playlist_id AND user_id = p_user_id
  );
$$;

-- Check if a user is member of a playlist
CREATE OR REPLACE FUNCTION is_playlist_member
(p_playlist_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS
(
    SELECT 1
FROM playlist_members
WHERE playlist_id = p_playlist_id AND user_id = p_user_id
  );
$$;

-- RLS Policies for playlists table
CREATE POLICY "playlists_select_policy"
    ON playlists FOR SELECT
    USING (
        is_private = false
        OR owner_id = auth.uid()
        OR is_playlist_collaborator(id, auth.uid())
        OR is_playlist_member(id, auth.uid())
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
    ON playlist_collaborators FOR
SELECT
    USING (
        user_id = auth.uid()
        OR is_playlist_owner(playlist_id, auth.uid())
    );

CREATE POLICY "pcollab_manage_policy"
    ON playlist_collaborators FOR ALL
    USING
(
        is_playlist_owner
(playlist_id, auth.uid
())
    );

-- RLS Policies for playlist_members table
CREATE POLICY "playlist_members_select_policy"
    ON playlist_members FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_playlist_owner(playlist_id, auth.uid())
        OR is_playlist_collaborator(playlist_id, auth.uid())
    );

CREATE POLICY "playlist_members_manage_policy"
    ON playlist_members FOR ALL
    USING (
        is_playlist_owner(playlist_id, auth.uid())
        OR is_playlist_collaborator(playlist_id, auth.uid())
    );

-- RLS Policies for playlist_tracks table
CREATE POLICY "playlist_tracks_select_policy"
    ON playlist_tracks FOR
SELECT
    USING (
        is_playlist_owner(playlist_id, auth.uid())
        OR is_playlist_collaborator(playlist_id, auth.uid())
        OR (playlist_id IN (
            SELECT id
        FROM playlists
        WHERE is_private = false
        ))
    );

CREATE POLICY "playlist_tracks_insert_policy"
    ON playlist_tracks FOR
INSERT
    WITH CHECK (
        is_playlist_owner(
playlist_id,
auth.uid()
)
        OR
(is_playlist_collaborator
(playlist_id, auth.uid
()) AND
(
            SELECT is_collaborative
FROM playlists
WHERE id = playlist_id
        )
= true)
    );

CREATE POLICY "playlist_tracks_update_policy"
    ON playlist_tracks FOR
UPDATE
    USING (
        is_playlist_owner(playlist_id, auth.uid()
)
        OR
(is_playlist_collaborator
(playlist_id, auth.uid
()) AND
(
            SELECT is_collaborative
FROM playlists
WHERE id = playlist_id
        )
= true)
    );

CREATE POLICY "playlist_tracks_delete_policy"
    ON playlist_tracks FOR
DELETE
    USING (
        is_playlist_owner
(playlist_id, auth.uid
())
        OR
(is_playlist_collaborator
(playlist_id, auth.uid
()) AND
(
            SELECT is_collaborative
FROM playlists
WHERE id = playlist_id
        )
= true)
    );

-- Function to automatically add owner as collaborator
CREATE OR REPLACE FUNCTION add_owner_as_collaborator
()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO playlist_collaborators
        (playlist_id, user_id, role, added_by)
    VALUES
        (NEW.id, NEW.owner_id, 'owner', NEW.owner_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to add owner as collaborator when playlist is created
CREATE TRIGGER add_owner_as_collaborator_trigger
    AFTER
INSERT ON
playlists
FOR
EACH
ROW
EXECUTE FUNCTION add_owner_as_collaborator
();

-- Function to get complete playlist data as JSON
CREATE OR REPLACE FUNCTION get_playlist_complete(p_playlist_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'name', p.name,
        'description', p.description,
        'is_private', p.is_private,
        'is_collaborative', p.is_collaborative,
        'cover_url', p.cover_url,
        'created_at', p.created_at,
        'updated_at', p.updated_at,
        'is_spotify_sync', p.is_spotify_sync,
        'spotify_id', p.spotify_id,
        'owner', json_build_object(
            'id', p.owner_id,
            'username', pr.username,
            'email', au.email,
            'avatar_url', pr.avatar_url,
            'bio', pr.bio
        ),
                'tracks', COALESCE(
            (SELECT json_agg(
            json_build_object(
                'spotify_id', pt.track_id,
                'position', pt.position,
                'added_by', pt.added_by,
                'added_at', pt.added_at
            ) ORDER BY pt.position
            )
            FROM playlist_tracks pt
            WHERE pt.playlist_id = p.id),
            '[]'::json
        ),
        'collaborators', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', pc.user_id,
                    'username', pr_collab.username,
                    'email', au_collab.email,
                    'avatar_url', pr_collab.avatar_url,
                    'role', pc.role,
                    'added_at', pc.added_at
                )
            )
            FROM playlist_collaborators pc
            JOIN auth.users au_collab ON pc.user_id = au_collab.id
            JOIN profiles pr_collab ON pc.user_id = pr_collab.id
            WHERE pc.playlist_id = p.id),
            '[]'::json
        ),
        'members', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', pm.user_id,
                    'username', pr_member.username,
                    'email', au_member.email,
                    'avatar_url', pr_member.avatar_url,
                    'added_at', pm.added_at
                )
            )
            FROM playlist_members pm
            JOIN auth.users au_member ON pm.user_id = au_member.id
            JOIN profiles pr_member ON pm.user_id = pr_member.id
            WHERE pm.playlist_id = p.id),
            '[]'::json
        )
    ) INTO result
    FROM playlists p
    JOIN auth.users au ON p.owner_id = au.id
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE p.id = p_playlist_id;

    RETURN result;
END;
$$;

-- Function to get user playlists with owner details
CREATE OR REPLACE FUNCTION get_user_playlists_with_owner
(p_user_id UUID)
RETURNS TABLE
(
    id UUID,
    name VARCHAR
(255),
    description TEXT,
    owner_id UUID,
    is_private BOOLEAN,
    is_collaborative BOOLEAN,
    cover_url TEXT,
    created_at TIMESTAMP
WITH TIME ZONE,
    updated_at TIMESTAMP
WITH TIME ZONE,
    owner_username VARCHAR
(255),
    owner_email VARCHAR
(255),
    owner_avatar_url TEXT,
    owner_bio TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
SELECT
    p.id,
    p.name,
    p.description,
    p.owner_id,
    p.is_private,
    p.is_collaborative,
    p.cover_url,
    p.created_at,
    p.updated_at,
    pr.username as owner_username,
    au.email as owner_email,
    pr.avatar_url as owner_avatar_url,
    pr.bio as owner_bio
FROM playlists p
    JOIN auth.users au ON p.owner_id = au.id
    JOIN profiles pr ON p.owner_id = pr.id
WHERE p.owner_id = p_user_id
ORDER BY p.created_at DESC;
$$;
