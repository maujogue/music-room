import { HTTPException } from '@hono/http-exception';
import type { CreatePlaylistPayload } from '@playlist';

export function validateCreatePlaylistPayload(body: any): CreatePlaylistPayload {
  // Vérifier les champs requis
  if (!body.name || typeof body.name !== 'string') {
    throw new HTTPException(400, { message: 'Name is required and must be a string' });
  }

  if (body.name.length < 1 || body.name.length > 255) {
    throw new HTTPException(400, { message: 'Name must be between 1 and 255 characters' });
  }

  // Vérifier les champs optionnels
  if (body.description !== undefined && typeof body.description !== 'string') {
    throw new HTTPException(400, { message: 'Description must be a string' });
  }

  if (body.cover_url !== undefined && typeof body.cover_url !== 'string') {
    throw new HTTPException(400, { message: 'Cover URL must be a string' });
  }

  if (body.is_private !== undefined && typeof body.is_private !== 'boolean') {
    throw new HTTPException(400, { message: 'is_private must be a boolean' });
  }

  if (body.is_collaborative !== undefined && typeof body.is_collaborative !== 'boolean') {
    throw new HTTPException(400, { message: 'is_collaborative must be a boolean' });
  }

  return {
    name: body.name,
    description: body.description,
    cover_url: body.cover_url,
    is_private: body.is_private ?? false,
    is_collaborative: body.is_collaborative ?? true,
  };
}

export function validateEditPlaylistPayload(body: any): Partial<CreatePlaylistPayload> {
  const payload: Partial<CreatePlaylistPayload> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length < 3 || body.name.length > 255) {
      throw new HTTPException(400, { message: 'Name must be a string between 3 and 255 characters' });
    }
    payload.name = body.name;
  }
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new HTTPException(400, { message: 'Description must be a string' });
    }
    payload.description = body.description;
  }
  if (body.cover_url !== undefined) {
    if (typeof body.cover_url !== 'string') {
      throw new HTTPException(400, { message: 'Cover URL must be a string' });
    }
    payload.cover_url = body.cover_url;
  }
  if (body.is_private !== undefined) {
    if (typeof body.is_private !== 'boolean') {
      throw new HTTPException(400, { message: 'is_private must be a boolean' });
    }
    payload.is_private = body.is_private;
  }
  if (body.is_collaborative !== undefined) {
    if (typeof body.is_collaborative !== 'boolean') {
      throw new HTTPException(400, { message: 'is_collaborative must be a boolean' });
    }
    payload.is_collaborative = body.is_collaborative;
  }

  return payload;
}

export function validateDeleteTracksPayload(body: any): { uris: string[] } {
  if (!body.uris || !Array.isArray(body.uris) || body.uris.some((uri: any) => typeof uri !== 'string')) {
    throw new HTTPException(400, { message: 'uris is required and must be an array of strings' });
  }

  return { uris: body.uris };
}

export function validateAddUserPayload(body: any): { user_id: string, role: string } {
  if (!body.user_id || typeof body.user_id !== 'string') {
    throw new HTTPException(400, { message: 'user_id is required and must be a string' });
  }
  if (!body.role || (body.role !== 'member' && body.role !== 'collaborator')) {
    throw new HTTPException(400, { message: 'role must be either "member" or "collaborator"' });
  }
  return { user_id: body.user_id, role: body.role };
}

export function validateRemoveUserPayload(body: any): { user_id: string, role?: string } {
  if (!body.user_id || typeof body.user_id !== 'string') {
    throw new HTTPException(400, { message: 'user_id is required and must be a string' });
  }
  if (body.role && body.role !== 'member' && body.role !== 'collaborator') {
    throw new HTTPException(400, { message: 'role must be either "member" or "collaborator" if provided' });
  }
  return { user_id: body.user_id, role: body.role };
}

export function validateAddTracksPayload(body: any): { uris: string[] } {
  if (!body.uris || !Array.isArray(body.uris) || body.uris.some((uri: any) => typeof uri !== 'string')) {
    throw new HTTPException(400, { message: 'uris is required and must be an array of strings' });
  }

  return { uris: body.uris };
}
