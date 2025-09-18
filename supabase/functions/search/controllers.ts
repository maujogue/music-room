import { fetchSpotifySearch } from './services/spotify.ts'
import {
	searchUsersByQuery,
	searchEventsByQuery,
	searchPlaylistsByQuery
 } from './services/supabase.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'

export async function search(c: Context) {
	const user = c.get('user')
	const spotify_token = c.get('spotify_token')
	const { q, type, limit, offset } = c.req.query()
	let {
		trackResults,
		playlistResults,
		userResults,
		eventResults
	} = []

	console.log('Search params:', { q, type, limit, offset });
	if (!q) {
		c.status(400)
		return c.json({ error: 'Query parameter "q" is required' })
	}
	if (!type) {
		c.status(400)
		return c.json({ error: 'Query parameter "type" is required' })
	}
	if (type === 'track') {
		trackResults = await searchTracks(spotify_token, { query: q, limit: Number(limit) || 20, offset: Number(offset) || 0 })
	}
	if (type === 'playlist' || type === 'all') {
		playlistResults = await searchPlaylistsByQuery({ query: q, limit: Number(limit) || 20, offset: Number(offset) || 0 })
	}
	if (type === 'user' || type === 'all') {
		userResults = await searchUsersByQuery(user.id, { query: q, limit: Number(limit) || 20 })
	}
	if (type === 'event' || type === 'all') {
		eventResults = await searchEventsByQuery({ query: q, limit: Number(limit) || 20, offset: Number(offset) || 0 })
		console.log('eventResults', eventResults);
	}

	c.status(200)
	return c.json({
		trackResults,
		playlistResults,
		userResults,
		eventResults
	})
}

async function searchTracks(spotify_token: string, params: { query: string, limit: number, offset: number }) {
	console.log('Searching tracks with params:', params);
	const trackResults = await fetchSpotifySearch(spotify_token, { ...params, type: 'track' })
	if (trackResults.error) {
		throw new HTTPException(trackResults.error.status || 500, { message: trackResults.error.message || 'Unknown error from Spotify API' })
	}
	return trackResults
}
