import * as Hono from "@hono/hono";
import { serve } from "@deno/server";
import { HTTPException } from "@hono/http-exception";
import { getCurrentUser, getUserSpotifyToken } from "@auth/utils";
import tracksRoutes from "./routes.ts";
import type { StatusCode } from "@hono/hono/utils/http-status";
import { loggingMiddleware } from "../utils/loggingMiddleware.ts";

const app = new Hono.Hono();

serve(app.fetch);

app.use("*", loggingMiddleware);

app.use("*", async (c: Hono.Context, next) => {
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

app.onError((err: Error, c: Hono.Context) => {
  console.error("Error occurred:", err);
  if (err instanceof HTTPException) {
    console.error("HTTPException details:", err.status, err.message);
    c.status(err.status as StatusCode);
    return c.json({ message: err.message });
  }
  return c.json({ error: "Internal Server Error", status: 500 });
});

app.route("/tracks", tracksRoutes);
