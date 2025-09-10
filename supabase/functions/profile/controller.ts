import { Context } from 'jsr:@hono/hono';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';
import {
  getProfile,
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  followUserById,
  unfollowUserById,
  searchUsersByQuery,
} from './service.ts';

export async function fetchProfile(c: Context): Promise<Response> {
  console.log('fetchProfile called');
  const user = c.get('user');
  const res = await getProfile(user.id);

  if (!res) {
    throw new HTTPException(500, { message: 'Failed to fetch profile' });
  }

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to fetch profile' });
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

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to update profile' });
  }

  c.status(200);
  return c.json(res.data);
}

export async function fetchFollowers(c: Context): Promise<Response> {
  console.log('fetchFollowers called');
  const user = c.get('user');
  const res = await getUserFollowers(user.id);

  if (!res) {
    throw new HTTPException(500, { message: 'Failed to fetch followers' });
  }

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to fetch followers' });
  }

  c.status(200);
  return c.json(res.data);
}

export async function fetchFollowing(c: Context): Promise<Response> {
  const user = c.get('user');
  const res = await getUserFollowing(user.id);

  if (!res) {
    throw new HTTPException(500, { message: 'Failed to fetch following' });
  }

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to fetch following' });
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

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to follow user' });
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

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to unfollow user' });
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
