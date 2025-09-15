import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';
//import { CreatePlaylistPayload } from '../types/playlist.d.ts';

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
