import { Hono } from "@hono/hono";
import { serve } from "@deno/server";
import { HTTPException } from "@hono/http-exception";
import { getCurrentUser, getUserSpotifyToken } from "@auth/utils";
import { requirePremiumSubscription } from "../me/services/supabase.ts";
import playlistRoutes from "./routes.ts";
import type { StatusCode } from "@hono/hono/utils/http-status";
import { loggingMiddleware } from "../utils/loggingMiddleware.ts";

const app = new Hono();

serve(app.fetch);

app.use("*", loggingMiddleware);

declare module "@hono/hono" {
  interface ContextVariableMap {
    user: Awaited<ReturnType<typeof getCurrentUser>>;
    spotify_token: Awaited<ReturnType<typeof getUserSpotifyToken>>;
  }
}
app.use("*", async (c, next) => {
  try {
    const user = await getCurrentUser(c.req);
    const token = await getUserSpotifyToken(user.id);
    c.set("user", user);
    c.set("spotify_token", token);
    await next();
  } catch (err) {
    const message = typeof err === "object" && err !== null && "message" in err
      ? (err as { message: string }).message
      : String(err);
    return c.json({ error: message }, 401);
  }
});

// Middleware to check premium subscription for mutation operations
app.use("/playlists", async (c, next) => {
  const method = c.req.method;
  const isMutation = ["POST", "PUT", "DELETE"].includes(method);

  if (isMutation) {
    try {
      const user = c.get("user");
      await requirePremiumSubscription(user.id);
    } catch (err) {
      // Check if it's a subscription error
      if (typeof err === "string") {
        try {
          const errorData = JSON.parse(err);
          if (errorData.subscription_required) {
            return c.json({
              error: "Premium subscription required",
              subscription_required: true,
            }, 403);
          }
        } catch (_parseErr) {
          // Not a subscription error, continue with normal error handling
        }
      }
      throw err;
    }
  }

  await next();
});

app.onError((err, c) => {
  console.error("Error occurred:", err);
  if (err instanceof HTTPException) {
    c.status(err.status as StatusCode);
    return c.json({ message: err.message });
  }
  return c.json({
    message: "Internal Server Error",
  }, 500);
});

app.route("/playlists", playlistRoutes);
