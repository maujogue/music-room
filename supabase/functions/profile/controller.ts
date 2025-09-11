import { Context } from 'jsr:@hono/hono';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';
import {
  getUserProfile,
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

  // If userId is "me", use current user's ID
  const targetUserId = userId === 'me' ? currentUser.id : userId;

  const res = await getUserProfile(targetUserId, currentUser?.id);

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

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to update profile' });
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

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({
      error: res.error.message || 'Failed to fetch user follows',
    });
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

export async function checkFriendship(c: Context): Promise<Response> {
  const userId1 = c.req.param('userId1');
  const userId2 = c.req.param('userId2');

  if (!userId1 || !userId2) {
    c.status(400);
    return c.json({
      error: 'Both userId1 and userId2 parameters are required',
    });
  }

  const res = await areUsersFriends(userId1, userId2);

  if (!res) {
    throw new HTTPException(500, { message: 'Failed to check friendship' });
  }

  if (res.error) {
    c.status(res.error.status || 500);
    return c.json({ error: res.error.message || 'Failed to check friendship' });
  }

  c.status(200);
  return c.json({ areFriends: res.data });
}
