import { createClient } from "@supabase/supabase-js";
import { HTTPException } from "@hono/http-exception";
import { formatDbError } from "@postgres/postgres_errors_map";
import type { PlaylistResponse, PlaylistRow } from "@playlist";
import type { ProfileResponse, ProfileWithFollowInfo } from "@profile";
import type { EventResponseReduced } from "@event";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export async function searchUsersByQuery(
  currentUserId: string,
  params: { query: string; limit?: string; offset?: string },
): Promise<ProfileWithFollowInfo[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      `
	  id,
	  username,
	  email,
	  avatar_url,
	  bio,
	  music_genre
	`,
    )
    .or(`username.ilike.%${params.query}%,email.ilike.%${params.query}%`)
    .neq('id', currentUserId)
    .range(
      Number(params.offset) || 0,
      (Number(params.offset) || 0) + (Number(params.limit) || 20) - 1,
    );

  if (profilesError) {
    console.error("Error searching users:", profilesError);
    const pgError = formatDbError(profilesError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  // Get follow relationships for these users
  const { data: follows, error: followsError } = await supabase
    .from("follows")
    .select("follower_id, following_id")
    .or(`follower_id.eq.${currentUserId},following_id.eq.${currentUserId}`);

  if (followsError) {
    console.error("Error fetching follow relationships:", followsError);
    const pgError = formatDbError(followsError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  // Create a map of relationships
  const followingSet = new Set(
    follows
      ?.filter((f) => f.follower_id === currentUserId)
      .map((f) => f.following_id) || [],
  );
  const followersSet = new Set(
    follows
      ?.filter((f) => f.following_id === currentUserId)
      .map((f) => f.follower_id) || [],
  );

  // Build search results with relationship info
  const searchResults: Array<ProfileWithFollowInfo> =
    profiles?.map((profile) => ({
      id: profile.id,
      username: profile.username,
      email: profile.email,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      music_genre: profile.music_genre,
      is_following: followingSet.has(profile.id),
      is_follower: followersSet.has(profile.id),
      is_friend: followingSet.has(profile.id) && followersSet.has(profile.id),
    })) || [];

  return searchResults;
}

export async function searchEventsByQuery(
  params: { query: string; limit?: string; offset?: string },
): Promise<EventResponseReduced[]> {
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select(
      "*, owner:profiles!events_owner_id_fkey(id, username, email, avatar_url, bio)",
    )
    .ilike("name", `%${params.query}%`)
    .eq("is_private", false)
    .range(
      Number(params.offset) || 0,
      (Number(params.offset) || 0) + (Number(params.limit) || 20) - 1,
    );
  if (eventsError) {
    console.error("Error searching events:", eventsError);
    const pgError = formatDbError(eventsError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
  return events;
}

export async function searchPlaylistsByQuery(
  params: { query: string; limit: string; offset: string },
): Promise<PlaylistResponse[]> {
  try {
    const { data: playlists, error: playlistsError } = await supabase
      .from("playlists")
      .select(
        `id, name, description, is_private, is_collaborative, cover_url, created_at, updated_at, owner_id`,
      )
      .eq("is_private", false)
      .ilike("name", `%${params.query}%`)
      .range(
        Number(params.offset) || 0,
        (Number(params.offset) || 0) + (Number(params.limit) || 20) - 1,
      );

    if (playlistsError) {
      console.error("Error searching playlists:", playlistsError);
      const pgError = formatDbError(playlistsError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }

    if (!playlists || playlists.length === 0) return [];

    const ownerIds = Array.from(
      new Set(playlists.map((p: PlaylistRow) => p.owner_id).filter(Boolean)),
    );

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email, avatar_url, bio")
      .in("id", ownerIds);

    if (profilesError) {
      console.error("Error fetching owner profiles:", profilesError);
      const pgError = formatDbError(profilesError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }

    const profileMap = new Map<string, ProfileResponse>();
    profiles?.forEach((pr: ProfileResponse) => profileMap.set(pr.id, pr));

    const results: PlaylistResponse[] = playlists.map((p: PlaylistRow) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      is_private: p.is_private,
      is_collaborative: p.is_collaborative,
      cover_url: p.cover_url ?? undefined,
      created_at: p.created_at,
      updated_at: p.updated_at,
      owner_id: p.owner_id,
      is_spotify_sync: p.is_spotify_sync || undefined,
      spotify_id: p.spotify_id || undefined,
      owner: profileMap.get(p.owner_id) || null,
    }));

    return results;
  } catch (err) {
    console.error("searchPlaylistsByQuery error:", err);
    throw err;
  }
}
