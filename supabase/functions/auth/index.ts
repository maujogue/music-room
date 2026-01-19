import { Hono } from "jsr:@hono/hono";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { HTTPException } from "https://deno.land/x/hono@v3.2.3/http-exception.ts";
import { getCurrentUser, getCurrentUserOptional } from "./utils.ts";
import authRoutes from "./routes.ts";
import { loggingMiddleware } from "../utils/loggingMiddleware.ts";

const app = new Hono();

serve(app.fetch);

app.use("*", loggingMiddleware);

app.use("*", async (c, next) => {
  try {
    if (c.req.url.includes("/spotify")) {
      // For Spotify routes, try to get user but don't require authentication
      // (needed for both login and connection flows)
      const user = await getCurrentUserOptional(c.req);
      if (user) {
        c.set("user", user);
      }
      return await next();
    }
    const user = await getCurrentUser(c.req);
    c.set("user", user);
    await next();
  } catch (err) {
    return c.json({ error: err.message }, 401);
  }
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({ message: err.message }, err.status);
  }

  console.error("Error occurred:", err);
  return c.json(
    {
      message: "Internal Server Error",
    },
    500,
  );
});

app.route("/auth", authRoutes);
