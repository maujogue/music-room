import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import {
  createSpotifyPlaylist,
  postItemsToSpotifyPlaylist,
  deleteItemsFromSpotifyPlaylist,
  fetchSpotifyPlaylist,
  fetchSpotifyUserProfile
} from './service.ts'


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
  const spotify_access_token = c.get('spotify_token')
  const body = await c.req.json()
  const user = await fetchSpotifyUserProfile(spotify_access_token)
  if (!user) {
    const errorResponse = new Response('Failed to fetch Spotify user profile', { status: 500 });
    throw new HTTPException(500, { res: errorResponse });
  }

  const res = await createSpotifyPlaylist(spotify_access_token, user.id, body)
  if (!res) {
    const errorResponse = new Response('Failed to delete Spotify playlist', { status: 500 });
    throw new HTTPException(500, { res: errorResponse });
  }

  if (res.error) {
    c.status(res.error.status || 500)
    return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
  }

  c.status(201)
  return c.json(res)
}

