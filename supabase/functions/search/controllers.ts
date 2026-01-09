import { fetchSpotifySearch } from './services/spotify.ts'
import {
	searchUsersByQuery,
	searchEventsByQuery,
	searchPlaylistsByQuery
} from './services/supabase.ts'
import { HTTPException } from '@hono/http-exception';
import { refreshSpotifyToken } from '@auth/utils';
import getPublicUrlForPath from '../../utils/get_public_url_for_path.tsx'
import { Context } from '@hono/hono';
import type { ProfileWithFollowInfo } from '@profile';
import type { PlaylistResponse } from "@playlist";
import type { EventResponseReduced } from '@event';
import type { SpotifyTrackResponse, TrackResponse } from '@track';

export async function search(c: Context) {
	const user = c.get('user')
	const spotify_token = c.get('spotify_token')
	const { q, type, limit, offset } = c.req.query()
	let userResults: ProfileWithFollowInfo[] = []
	let playlistResults: PlaylistResponse[] = []
	let eventResults: EventResponseReduced[] = []
	let trackResults: TrackResponse[] = []


	if (!q) {
		c.status(400)
		return c.json({ error: 'Query parameter "q" is required' })
	}
	if (!type) {
		c.status(400)
		return c.json({ error: 'Query parameter "type" is required' })
	}
	if (type === 'track') {
		await refreshSpotifyToken(user.id);
		trackResults = await searchTracks(spotify_token, { query: q, limit, offset })
	}
	if (type === 'playlist' || type === 'all') {
		playlistResults = await searchPlaylistsByQuery({ query: q, limit, offset })
	}
	if (type === 'user' || type === 'all') {
		userResults = await searchUsersByQuery(user.id, { query: q, limit, offset })
	}
	if (type === 'event' || type === 'all') {
		eventResults = await searchEventsByQuery({ query: q, limit, offset })
		eventResults = await Promise.all(eventResults.map(async (event) => {
			if (event.image_url) {
				event.image_url = await getPublicUrlForPath(event.image_url)
			}
			return event
		}))
	}

	c.status(200)
	return c.json({
		trackResults,
		playlistResults,
		userResults,
		eventResults
	})
}

async function searchTracks(
	spotify_token: string,
	params: { query: string, limit: string, offset: string })
	: Promise<TrackResponse[]> {

	const res: SpotifyTrackResponse = await fetchSpotifySearch(spotify_token, { ...params, type: 'track' })
	if (res.error) {
		throw new HTTPException(res.error.status || 500, { message: res.error.message || 'Unknown error from Spotify API' })
	}
	return res.tracks
}
