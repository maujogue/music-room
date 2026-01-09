import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';
import type { Context } from 'jsr:@hono/hono';

export async function safeJsonFromContext<T = unknown>(c: Context): Promise<T> {
  try {
    return await c.req.json();
  } catch (err) {
    throw new HTTPException(400, {
      message: "Invalid JSON body: unable to parse request payload",
    });
  }
}