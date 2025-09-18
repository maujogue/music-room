import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { formatDbError } from '../../../utils/postgres_errors_map.tsx';

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export async function searchUsersByQuery(
  currentUserId: string,
  params: { query: string, limit?: number}
): Promise<{ data: any[]; error: any }> {
  const { data: profiles, error: profilesError } = await supabase
	.from('profiles')
	.select(
	  `
	  id,
	  username,
	  email,
	  avatar_url,
	  bio,
	  music_genre
	`
	)
	.or(`username.ilike.%${params.query}%,email.ilike.%${params.query}%`)
	.limit(params.limit || 20);

  if (profilesError) {
		console.error('Error searching users:', profilesError);
		const pgError = formatDbError(profilesError);
		throw new HTTPException(pgError.status, { message: pgError.message });
  }

  // Get follow relationships for these users
  const { data: follows, error: followsError } = await supabase
	.from('follows')
	.select('follower_id, following_id')
	.or(`follower_id.eq.${currentUserId},following_id.eq.${currentUserId}`);

  if (followsError) {
		console.error('Error fetching follow relationships:', followsError);
		const pgError = formatDbError(followsError);
		throw new HTTPException(pgError.status, { message: pgError.message });
  }

  // Create a map of relationships
  const followingSet = new Set(
	follows
	  ?.filter((f) => f.follower_id === currentUserId)
	  .map((f) => f.following_id) || []
  );
  const followersSet = new Set(
	follows
	  ?.filter((f) => f.following_id === currentUserId)
	  .map((f) => f.follower_id) || []
  );


  // Build search results with relationship info
  const searchResults =
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
	params: { query: string, limit?: number}
): Promise<{ data: any[]; error: any }> {
	const { data: events, error: eventsError } = await supabase
	.from('events')
	.select(
	  `
	  id,
	  name,
	  description,
	  beginning_at,
	  image_url
	`
	)
	.ilike('name', `%${params.query}%`)
	.limit(params.limit || 20);

	if (eventsError) {
		console.error('Error searching events:', eventsError);
		const pgError = formatDbError(eventsError);
		throw new HTTPException(pgError.status, { message: pgError.message });
	}
	return events;
}

export async function searchPlaylistsByQuery(
	params: { query: string, limit: number, offset: number }
): Promise<PlaylistResponse[]> {
	try {
		// Fetch playlists without embedding owner to avoid relying on schema relationships
		const { data: playlists, error: playlistsError } = await supabase
			.from('playlists')
			.select(
				`id, name, description, is_private, is_collaborative, cover_url, created_at, updated_at, owner_id`
			)
			.eq('is_private', false)
			.ilike('name', `%${params.query}%`)
			.range(params.offset, params.offset + params.limit - 1);

		if (playlistsError) {
			console.error('Error searching playlists:', playlistsError);
			const pgError = formatDbError(playlistsError);
			throw new HTTPException(pgError.status, { message: pgError.message });
		}

		if (!playlists || playlists.length === 0) return [];

		// Collect owner ids and fetch profiles in batch
		const ownerIds = Array.from(new Set(playlists.map((p: any) => p.owner_id).filter(Boolean)));

		const { data: profiles, error: profilesError } = await supabase
			.from('profiles')
			.select('id, username, email, avatar_url, bio')
			.in('id', ownerIds);

		if (profilesError) {
			console.error('Error fetching owner profiles:', profilesError);
			const pgError = formatDbError(profilesError);
			throw new HTTPException(pgError.status, { message: pgError.message });
		}

		const profileMap = new Map<string, any>();
		profiles?.forEach((pr: any) => profileMap.set(pr.id, pr));

		// Attach owner object to playlists
		const results: PlaylistResponse[] = playlists.map((p: any) => ({
			id: p.id,
			name: p.name,
			description: p.description,
			is_private: p.is_private,
			is_collaborative: p.is_collaborative,
			cover_url: p.cover_url,
			created_at: p.created_at,
			updated_at: p.updated_at,
			owner: profileMap.get(p.owner_id) || null,
		}));

		return results;
	} catch (err) {
		console.error('searchPlaylistsByQuery error:', err);
		throw err;
	}
}
