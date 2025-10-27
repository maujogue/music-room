import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getSupabasePlaylistById } from './services/supabase.ts'
import { PlaylistResponse, PlaylistCollaborator, PlaylistMember } from "@playlist";

export const ROLES = {
  MEMBER: "member",
  COLLABORATOR: "collaborator",
  OWNER: "owner",
  NONE: "none",
} as const;

export const PERMISSIONS = {
  READ_PLAYLIST: "read_playlist",
  ADD_SONG: "add_song",
  ADD_USER: "add_user",
  DELETE_PLAYLIST: "delete_playlist",
  UPDATE_USER_ROLE: "update_user_role",
  REMOVE_USER: "remove_user",
  EDIT_PLAYLIST: "edit_playlist",
  DELETE_SONG: "delete_song",
} as const;

export function getUserRoleInPlaylist(
  playlist: PlaylistResponse, userId: string): 
  'owner' | 'collaborator' | 'member' | 'none' {
  if (playlist.owner.id === userId) {
    return ROLES.OWNER;
  }

  const collaborator = playlist.collaborators?.find((collab: PlaylistCollaborator) => collab.id === userId);
  if (collaborator) {
    return ROLES.COLLABORATOR;
  }

  const member = playlist.members?.find((member: PlaylistMember) => member.id === userId);
  if (member) {
    return ROLES.MEMBER;
  }

  return ROLES.NONE;
}

export function canUserPerformAction(role: string | null, permission: string, playlist: PlaylistResponse): boolean {
  switch (permission) {
    case PERMISSIONS.READ_PLAYLIST:
      if (!playlist.is_private) {
        return true;
      }
      return role === ROLES.OWNER || role === ROLES.COLLABORATOR || role === ROLES.MEMBER;

    case PERMISSIONS.ADD_SONG:
      if (playlist.is_collaborative) {
        return true;
      }
      return role === ROLES.OWNER || role === ROLES.COLLABORATOR;

    case PERMISSIONS.DELETE_SONG:
      if (playlist.is_collaborative) {
        return role === ROLES.OWNER || role === ROLES.COLLABORATOR;
      }
      return role === ROLES.OWNER;

    case PERMISSIONS.ADD_USER:
      if (!playlist.is_private) {
        return true;
      }
      return role === ROLES.OWNER || role === ROLES.COLLABORATOR;

    case PERMISSIONS.DELETE_PLAYLIST:
      return role === ROLES.OWNER;

    case PERMISSIONS.UPDATE_USER_ROLE:
      return role === ROLES.OWNER;

    case PERMISSIONS.REMOVE_USER:
      return role === ROLES.OWNER;

    case PERMISSIONS.EDIT_PLAYLIST:
      return role === ROLES.OWNER;

    default:
      return false;
  }
}

// Middleware pour vérifier les permissions
export async function checkPermission(playlistId: string, userId: string, permission: string) {
  const playlist = await getSupabasePlaylistById(playlistId);

  if (!playlist) {
    throw new HTTPException(404, { message: 'Playlist not found' });
  }

  const userRole = getUserRoleInPlaylist(playlist, userId);
  const hasPermission = canUserPerformAction(userRole, permission, playlist);

  if (!hasPermission) {
    throw new HTTPException(403, {
      message: `Insufficient permissions. Required: ${permission}, User role: ${userRole || 'none'}`
    });
  }

  return playlist;
}

export function checkPlaylistAccess(playlist: PlaylistResponse, userId: string) {
  if (!playlist) {
    throw new HTTPException(404, { message: 'Playlist not found' });
  }

  if (!playlist.is_private) {
    return playlist;
  }

  const userRole = getUserRoleInPlaylist(playlist, userId);
  if (!userRole) {
    throw new HTTPException(403, { message: 'Access denied to private playlist' });
  }
}
