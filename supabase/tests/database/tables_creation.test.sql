BEGIN;

-- Plan: 69 tests total (6 for profiles, 11 for events, 6 for event_members, 4 for follows, 11 for playlists, 5 for playlist_collaborators, 5 for playlist_tracks, 5 for playlist_members, 6 for location, 5 for track_votes, 5 for oauth_state)
SELECT
    plan (69);

-- ==============================================================================
-- PROFILES TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'profiles',
        'Table profiles should exist'
    );

SELECT
    has_column (
        'public',
        'profiles',
        'id',
        'Column id should exist in profiles'
    );

SELECT
    has_column (
        'public',
        'profiles',
        'username',
        'Column username should exist in profiles'
    );

SELECT
    has_column (
        'public',
        'profiles',
        'email',
        'Column email should exist in profiles'
    );

SELECT
    has_column (
        'public',
        'profiles',
        'avatar_url',
        'Column avatar_url should exist in profiles'
    );

SELECT
    has_column (
        'public',
        'profiles',
        'bio',
        'Column bio should exist in profiles'
    );

-- ==============================================================================
-- EVENTS TABLE TESTS
-- ==============================================================================
SELECT
    has_table ('public', 'events', 'Table events should exist');

SELECT
    has_column (
        'public',
        'events',
        'id',
        'Column id should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'name',
        'Column name should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'image_url',
        'Column image_url should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'description',
        'Column description should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'playlist_id',
        'Column playlist_id should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'owner_id',
        'Column owner_id should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'created_at',
        'Column created_at should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'beginning_at',
        'Column beginning_at should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'is_private',
        'Column is_private should exist in events'
    );

SELECT
    has_column (
        'public',
        'events',
        'everyone_can_vote',
        'Column everyone_can_vote should exist in events'
    );

-- ==============================================================================
-- EVENT_MEMBERS TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'event_members',
        'Table event_members should exist'
    );

SELECT
    has_column (
        'public',
        'event_members',
        'role',
        'Column role should exist in event_members'
    );

SELECT
    has_column (
        'public',
        'event_members',
        'event_id',
        'Column event_id should exist in event_members'
    );

SELECT
    has_column (
        'public',
        'event_members',
        'profile_id',
        'Column profile_id should exist in event_members'
    );

SELECT
    has_column (
        'public',
        'event_members',
        'vote_count',
        'Column vote_count should exist in event_members'
    );

SELECT
    has_column (
        'public',
        'event_members',
        'max_votes',
        'Column max_votes should exist in event_members'
    );

-- ==============================================================================
-- FOLLOWS TABLE TESTS
-- ==============================================================================
SELECT
    has_table ('public', 'follows', 'Table follows should exist');

SELECT
    has_column (
        'public',
        'follows',
        'follower_id',
        'Column follower_id should exist in follows'
    );

SELECT
    has_column (
        'public',
        'follows',
        'following_id',
        'Column following_id should exist in follows'
    );

SELECT
    has_column (
        'public',
        'follows',
        'created_at',
        'Column created_at should exist in follows'
    );

-- ==============================================================================
-- PLAYLISTS TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'playlists',
        'Table playlists should exist'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'id',
        'Column id should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'name',
        'Column name should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'description',
        'Column description should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'owner_id',
        'Column owner_id should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'is_private',
        'Column is_private should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'is_collaborative',
        'Column is_collaborative should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'can_invite',
        'Column can_invite should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'cover_url',
        'Column cover_url should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'created_at',
        'Column created_at should exist in playlists'
    );

SELECT
    has_column (
        'public',
        'playlists',
        'updated_at',
        'Column updated_at should exist in playlists'
    );

-- ==============================================================================
-- PLAYLIST_COLLABORATORS TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'playlist_collaborators',
        'Table playlist_collaborators should exist'
    );

SELECT
    has_column (
        'public',
        'playlist_collaborators',
        'id',
        'Column id should exist in playlist_collaborators'
    );

SELECT
    has_column (
        'public',
        'playlist_collaborators',
        'playlist_id',
        'Column playlist_id should exist in playlist_collaborators'
    );

SELECT
    has_column (
        'public',
        'playlist_collaborators',
        'user_id',
        'Column user_id should exist in playlist_collaborators'
    );

SELECT
    has_column (
        'public',
        'playlist_collaborators',
        'role',
        'Column role should exist in playlist_collaborators'
    );

-- ==============================================================================
-- PLAYLIST_TRACKS TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'playlist_tracks',
        'Table playlist_tracks should exist'
    );

SELECT
    has_column (
        'public',
        'playlist_tracks',
        'id',
        'Column id should exist in playlist_tracks'
    );

SELECT
    has_column (
        'public',
        'playlist_tracks',
        'playlist_id',
        'Column playlist_id should exist in playlist_tracks'
    );

SELECT
    has_column (
        'public',
        'playlist_tracks',
        'track_id',
        'Column track_id should exist in playlist_tracks'
    );

SELECT
    has_column (
        'public',
        'playlist_tracks',
        'position',
        'Column position should exist in playlist_tracks'
    );

-- ==============================================================================
-- PLAYLIST_MEMBERS TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'playlist_members',
        'Table playlist_members should exist'
    );

SELECT
    has_column (
        'public',
        'playlist_members',
        'id',
        'Column id should exist in playlist_members'
    );

SELECT
    has_column (
        'public',
        'playlist_members',
        'playlist_id',
        'Column playlist_id should exist in playlist_members'
    );

SELECT
    has_column (
        'public',
        'playlist_members',
        'user_id',
        'Column user_id should exist in playlist_members'
    );

SELECT
    has_column (
        'public',
        'playlist_members',
        'added_at',
        'Column added_at should exist in playlist_members'
    );

-- ==============================================================================
-- LOCATION TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'location',
        'Table location should exist'
    );

SELECT
    has_column (
        'public',
        'location',
        'id',
        'Column id should exist in location'
    );

SELECT
    has_column (
        'public',
        'location',
        'event_id',
        'Column event_id should exist in location'
    );

SELECT
    has_column (
        'public',
        'location',
        'coordinates',
        'Column coordinates should exist in location'
    );

SELECT
    has_column (
        'public',
        'location',
        'venuename',
        'Column venuename should exist in location'
    );

SELECT
    has_column (
        'public',
        'location',
        'address',
        'Column address should exist in location'
    );

-- ==============================================================================
-- TRACK_VOTES TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'track_votes',
        'Table track_votes should exist'
    );

SELECT
    has_column (
        'public',
        'track_votes',
        'id',
        'Column id should exist in track_votes'
    );

SELECT
    has_column (
        'public',
        'track_votes',
        'event_id',
        'Column event_id should exist in track_votes'
    );

SELECT
    has_column (
        'public',
        'track_votes',
        'track_id',
        'Column track_id should exist in track_votes'
    );

SELECT
    has_column (
        'public',
        'track_votes',
        'vote_count',
        'Column vote_count should exist in track_votes'
    );

-- ==============================================================================
-- OAUTH_STATE TABLE TESTS
-- ==============================================================================
SELECT
    has_table (
        'public',
        'oauth_state',
        'Table oauth_state should exist'
    );

SELECT
    has_column (
        'public',
        'oauth_state',
        'id',
        'Column id should exist in oauth_state'
    );

SELECT
    has_column (
        'public',
        'oauth_state',
        'state',
        'Column state should exist in oauth_state'
    );

SELECT
    has_column (
        'public',
        'oauth_state',
        'user_id',
        'Column user_id should exist in oauth_state'
    );

SELECT
    has_column (
        'public',
        'oauth_state',
        'created_at',
        'Column created_at should exist in oauth_state'
    );

-- Complete the tests
SELECT
    *
FROM
    finish ();

ROLLBACK;
