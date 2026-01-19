// @deno-types="https://esm.sh/@hono/hono/types/index.ts"
import { Context, Next } from "jsr:@hono/hono";
import { logApiRequest } from "./logger.ts";

/**
 * Middleware to log API requests with device metadata
 * Should be added AFTER authentication middleware to get user_id
 */
export async function loggingMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const url = new URL(c.req.url);
  const endpoint = url.pathname;
  const method = c.req.method;

  // Extract device headers from request
  const platform = c.req.header("X-App-Platform") || "unknown";
  const deviceModel = c.req.header("X-App-Device") || "unknown";
  const osVersion = c.req.header("X-App-OS-Version") || "unknown";
  const appVersion = c.req.header("X-App-Version") || "unknown";

  let user_id: string | undefined;
  let statusCode = 200;
  let errorMessage: string | undefined;

  try {
    await next();

    const user = c.get("user");
    user_id = user?.id;

    // Get status code from response
    statusCode = c.res.status || 200;
  } catch (err) {
    // Capture error information
    statusCode = err instanceof Error && "status" in err
      ? (err as any).status
      : 500;
    errorMessage = err instanceof Error ? err.message : String(err);
  } finally {
    // Calculate request duration
    const requestDuration = Date.now() - startTime;

    // Log the request (fire-and-forget, won't block response)
    logApiRequest({
      user_id,
      endpoint,
      method,
      status_code: statusCode,
      platform,
      device_model: deviceModel,
      os_version: osVersion,
      app_version: appVersion,
      error_message: errorMessage,
      request_duration_ms: requestDuration,
    });
  }
}
