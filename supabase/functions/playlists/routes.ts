import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import {
  deleteItemsFromPlaylist,
  addItemsToPlaylist,
  fetchPlaylistItems,
  createPlaylist
} from './controller.ts'

const playlistRoutes = new Hono()

playlistRoutes.post('/', createPlaylist)

playlistRoutes.get('/:id', fetchPlaylistItems)

playlistRoutes.post('/:id/tracks', addItemsToPlaylist)

playlistRoutes.delete('/:id/tracks', deleteItemsFromPlaylist)

export default playlistRoutes
