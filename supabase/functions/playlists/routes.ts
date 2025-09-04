import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import { deleteItemsFromPlaylist, addItemsToPlaylist, fetchPlaylistItems, createPlaylist } from './controller.ts'

const playlistRoutes = new Hono()

playlistRoutes.post('/', async (c) => {
	return createPlaylist(c)
})

playlistRoutes.get('/:id', async (c) => {
  return fetchPlaylistItems(c)
})

playlistRoutes.post('/:id/tracks', async (c) => {
  return addItemsToPlaylist(c)
})

playlistRoutes.delete('/:id/tracks', async (c) => {
  return deleteItemsFromPlaylist(c)
})

export default playlistRoutes
