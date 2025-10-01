import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getSupabaseEventById } from './service.ts'

export const ROLES = {
  MEMBER: "member",
  VOTER: "voter",
  INVITER: "inviter",
  COLLABORATOR: "collaborator",
  OWNER: "owner",
} as const;

export const PERMISSIONS = {
  READ_EVENT: "read_event",
  VOTE: "vote",
  UNVOTE: "unvote",
  DELETE_EVENT: "delete_event",
  UPDATE_USER_ROLE: "update_user_role",
  ADD_USER: "add_user",
  REMOVE_USER: "remove_user",
  EDIT_EVENT: "edit_event",
} as const;

export function getUserRoleInEvent(event: any, userId: string): string | null {
  if (event.owner.id === userId) {
    return ROLES.OWNER;
  }

  const member = event.members?.find((member: any) => member.id === userId);
  if (member) {
    switch (member.role) {
      case 'member':
        return ROLES.MEMBER;
      case 'voter':
        return ROLES.VOTER;
      case 'inviter':
        return ROLES.INVITER;
      case 'collaborator':
        return ROLES.COLLABORATOR;
      default:
        return null;
    }
  }

  return null;
}

export function canUserPerformAction(role: string | null, permission: string, event: any): boolean {
  switch (permission) {
    case PERMISSIONS.READ_EVENT:
      if (!event.is_private) {
        return true;
      }
      return !role;

    case PERMISSIONS.VOTE:
      if (event.everyone_can_vote) {
        return true;
      }
      if (!role || role === ROLES.MEMBER || role === ROLES.INVITER) {
        return false;
      }
      return true;

    case PERMISSIONS.DELETE_EVENT:
      return role === ROLES.OWNER;

    case PERMISSIONS.ADD_USER:
      if (!event.is_private) {
        return true;
      }
      if (!role || role === ROLES.MEMBER || role === ROLES.VOTER) {
        return false;
      }
      return true;

    case PERMISSIONS.UNVOTE:
      if (event.everyone_can_vote) {
        return true;
      }
      if (!role || role === ROLES.MEMBER || role === ROLES.INVITER) {
        return false;
      }
      return true;

    case PERMISSIONS.DELETE_EVENT:
      return role === ROLES.OWNER;

    case PERMISSIONS.UPDATE_USER_ROLE:
      return role === ROLES.OWNER;

    case PERMISSIONS.REMOVE_USER:
      if (event.owner_id === user_id) {
        throw new HTTPException(403, { message: 'Owner cannot be removed from the event' });
      }
      return role === ROLES.OWNER;

    case PERMISSIONS.EDIT_EVENT:
      return role === ROLES.OWNER;

    default:
      return false;
  }
}

// Middleware pour vérifier les permissions
export async function checkPermission(eventId: string, userId: string, permission: string) {
  const event = await getSupabaseEventById(eventId);

  if (!event) {
    throw new HTTPException(404, { message: 'Event not found' });
  }

  const userRole = getUserRoleInEvent(event, userId);
  const hasPermission = canUserPerformAction(userRole, permission, event);

  if (!hasPermission) {
    throw new HTTPException(403, {
      message: `Insufficient permissions. Required: ${permission}, User role: ${userRole || 'none'}`
    });
  }

  return event;
}

export async function checkEventAccess(event: EventResponse, userId: string) {
  if (!event) {
    throw new HTTPException(404, { message: 'Event not found' });
  }

  if (!event.is_private) {
    return event;
  }

  const userRole = getUserRoleInEvent(event, userId);
  if (!userRole) {
    throw new HTTPException(403, { message: 'Access denied to private event' });
  }
}
