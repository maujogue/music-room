import { Context } from "@hono/hono";
import { HTTPException } from "@hono/http-exception";
import {
  followUserById,
  getUserFollows,
  getUserProfileWithFollows,
  unfollowUserById,
  updateUserProfile,
} from "./service.ts";
import type { ProfileWithFollowInfo } from "@profile";
import { validateUpdateProfilePayload } from "./validators.ts";
import { safeJsonFromContext } from "@utils/parsing";

export async function fetchUserProfile(c: Context): Promise<Response> {
  const userId = c.req.param("userId");
  const currentUser = c.get("user");

  const res: ProfileWithFollowInfo | null = await getUserProfileWithFollows(
    userId,
    currentUser.id,
  );

  if (!res) {
    c.status(404);
    return c.json({ error: "User profile not found" });
  }

  c.status(200);
  return c.json(res);
}

export async function updateProfile(c: Context): Promise<Response> {
  const user = c.get("user");
  const body = await safeJsonFromContext(c);

  const { valid, errors, profilePayload } = validateUpdateProfilePayload(body);
  if (!valid) {
    c.status(400);
    return c.json({ error: "Invalid payload", details: errors });
  }

  const res = await updateUserProfile(user.id, profilePayload);
  if (!res) {
    throw new HTTPException(500, { message: "Failed to update profile" });
  }

  c.status(200);
  return c.json(res);
}

export async function fetchUserFollows(c: Context): Promise<Response> {
  const userId = c.req.param("userId");
  const currentUser = c.get("user");

  const res = await getUserFollows(userId, currentUser?.id);
  if (!res) {
    throw new HTTPException(500, { message: "Failed to fetch user follows" });
  }

  c.status(200);
  return c.json(res);
}

export async function followUser(c: Context): Promise<Response> {
  const user = c.get("user");
  const userId = c.req.param("userId");

  await followUserById(user.id, userId);

  c.status(200);
  return c.json({ success: true });
}

export async function unfollowUser(c: Context): Promise<Response> {
  const user = c.get("user");
  const userId = c.req.param("userId");

  await unfollowUserById(user.id, userId);

  c.status(200);
  return c.json({ success: true });
}
