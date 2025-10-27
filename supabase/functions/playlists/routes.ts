import { Hono } from '@hono/hono'
import {
  deleteItemsFromPlaylist,
  addItemsToPlaylist,
  fetchPlaylistItems,
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  addUserToPlaylist,
  removeUserFromPlaylist
} from './controller.ts'

const playlistRoutes = new Hono()

playlistRoutes.post('/', createPlaylist)

playlistRoutes.get('/:id', fetchPlaylistItems)

playlistRoutes.delete('/:id', deletePlaylist)

playlistRoutes.put('/:id', updatePlaylist)

playlistRoutes.post('/:id/tracks', addItemsToPlaylist)

playlistRoutes.delete('/:id/tracks', deleteItemsFromPlaylist)

playlistRoutes.post('/:id/users', addUserToPlaylist)

playlistRoutes.delete('/:id/users', removeUserFromPlaylist)

export default playlistRoutes
