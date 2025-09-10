-- Add privacy settings to profiles table
ALTER TABLE profiles
ADD COLUMN privacy_setting TEXT DEFAULT 'public' CHECK (
    privacy_setting IN ('public', 'friends', 'private')
);

-- Create follows table for user relationships
CREATE TABLE
    follows (
        follower_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
        following_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            PRIMARY KEY (follower_id, following_id),
            CHECK (follower_id != following_id) -- Prevent self-following
    );

-- Create indexes for performance
CREATE INDEX idx_follows_follower ON follows (follower_id);

CREATE INDEX idx_follows_following ON follows (following_id);

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows table
-- Users can see who they follow and who follows them
CREATE POLICY "Users can view their own follows" ON follows FOR
SELECT
    USING (
        follower_id = auth.uid ()
        OR following_id = auth.uid ()
    );

-- Users can follow others
CREATE POLICY "Users can follow others" ON follows FOR INSERT
WITH
    CHECK (follower_id = auth.uid ());

-- Users can unfollow others
CREATE POLICY "Users can unfollow others" ON follows FOR DELETE USING (follower_id = auth.uid ());

-- Update profiles RLS to respect privacy settings
-- Users can always see their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT
    USING (id = auth.uid ());

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT
    USING (privacy_setting = 'public');

-- Friends-only profiles are viewable by mutual followers
CREATE POLICY "Friends-only profiles are viewable by mutual followers" ON profiles FOR
SELECT
    USING (
        privacy_setting = 'friends'
        AND EXISTS (
            SELECT
                1
            FROM
                follows f1
            WHERE
                f1.follower_id = auth.uid ()
                AND f1.following_id = profiles.id
        )
        AND EXISTS (
            SELECT
                1
            FROM
                follows f2
            WHERE
                f2.follower_id = profiles.id
                AND f2.following_id = auth.uid ()
        )
    );

-- Private profiles are only viewable by the user themselves
CREATE POLICY "Private profiles are only viewable by owner" ON profiles FOR
SELECT
    USING (
        privacy_setting = 'private'
        AND id = auth.uid ()
    );
