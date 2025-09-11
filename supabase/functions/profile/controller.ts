import { Context } from 'jsr:@hono/hono';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';
import {
  getUserProfile,
  getUserProfileWithFollows,
  updateUserProfile,
  getUserFollows,
  followUserById,
  unfollowUserById,
  searchUsersByQuery,
  areUsersFriends,
} from './service.ts';

export async function fetchUserProfile(c: Context): Promise<Response> {
  const userId = c.req.param('userId');
  const currentUser = c.get('user');

  let res;
  // If userId is "me", use current user's ID
  if (userId === 'me') {
    res = await getUserProfile(currentUser.id);
  } else {
    res = await getUserProfileWithFollows(userId, currentUser.id);
  }
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to fetch user profile' });
  }

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({
      error: res.error.message || 'Failed to fetch user profile',
    });
  }

  c.status(200);
  return c.json(res.data);
}

export async function updateProfile(c: Context): Promise<Response> {
  const user = c.get('user');
  const body = await c.req.json();

  const res = await updateUserProfile(user.id, body);
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to update profile' });
  }

  c.status(200);
  return c.json(res.data);
}

export async function fetchUserFollows(c: Context): Promise<Response> {
  const userId = c.req.param('userId');
  const currentUser = c.get('user');

  const res = await getUserFollows(userId, currentUser?.id);
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to fetch user follows' });
  }

  c.status(200);
  return c.json(res.data);
}

export async function followUser(c: Context): Promise<Response> {
  const user = c.get('user');
  const userId = c.req.param('userId');

  const res = await followUserById(user.id, userId);
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to follow user' });
  }

  c.status(200);
  return c.json({ success: true });
}

export async function unfollowUser(c: Context): Promise<Response> {
  const user = c.get('user');
  const userId = c.req.param('userId');

  const res = await unfollowUserById(user.id, userId);
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to unfollow user' });
  }

  c.status(200);
  return c.json({ success: true });
}

export async function searchUsers(c: Context): Promise<Response> {
  const user = c.get('user');
  const query = c.req.query('q');

  if (!query) {
    c.status(400);
    return c.json({ error: 'Query parameter "q" is required' });
  }

  const res = await searchUsersByQuery(user.id, query);
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to search users' });
  }

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to search users' });
  }

  c.status(200);
  return c.json(res.data);
}
