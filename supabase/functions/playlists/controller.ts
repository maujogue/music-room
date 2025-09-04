import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'

export async function deleteItemsFromPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const spotify_access_token = c.get('spotify_token')
  const body = await c.req.json()
  const tracks = body.tracks


  const res = await deleteItemsFromSpotifyPlaylist(
    spotify_access_token,
    id,
    { tracks }
  )
  if (!res) {
    const errorResponse = new Response('Failed to remove items from Spotify playlist', { status: 500 });
    throw new HTTPException(500, { res: errorResponse });
  }

  c.status(200)
  return c.json(res)
}


export async function addItemsToPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const spotify_access_token = c.get('spotify_token')
  const body = await c.req.json()
  const uris = body.uris
  const position = body.position || 0

  const res = await postItemsToSpotifyPlaylist(spotify_access_token, id, { uris, position })
  if (!res) {
    console.error('Failed to add items to Spotify playlist')
    const errorResponse = new Response('Failed to add items to Spotify playlist', { status: 500 });
    throw new HTTPException(500, { res: errorResponse });
  }

  c.status(201)
  return c.json(res)
}

export async function fetchPlaylistItems(c: Context): Promise<any> {
  const id = c.req.param('id')
  const spotify_access_token = c.get('spotify_token')

  const playlist_items = await fetchSpotifyPlaylist(spotify_access_token, id)

  if (!playlist_items) {
    c.status(500)
    return c.text('Failed to fetch Spotify playlists')
  }

  c.status(200)
  return c.json(playlist_items)
}

export async function createPlaylist(c: Context): Promise<any> {
	const id = c.req.param('id')
  	const spotify_access_token = c.get('spotify_token')

  	const res = await createSpotifyPlaylist(spotify_access_token, id)
  	if (!res) {
  		const errorResponse = new Response('Failed to delete Spotify playlist', { status: 500 });
  		throw new HTTPException(500, { res: errorResponse });
  	}

  	c.status(200)
  	return c.json(res)
}

async function createSpotifyPlaylist(
	spotify_token: string,
	user_id: string,
	body: {name: string, description: string, public: boolean, collaborative: boolean}): Promise<any> {
	  const response = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
		method: 'POST',
		headers: {
		  Authorization: `Bearer ${spotify_token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	  });
	  return response.json();
}

async function postItemsToSpotifyPlaylist(
  spotify_token: string,
  id: string,
  body: { uris: string[], position?: number }): Promise<any> {

    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${spotify_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async function deleteItemsFromSpotifyPlaylist(spotify_token: string, id: string, body: { uris: string[] }): Promise<any> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${spotify_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async function fetchSpotifyPlaylist(spotify_token: string, id: string): Promise<any> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: {
        Authorization: `Bearer ${spotify_token}`,
      },
    });
    return response.json();
}

