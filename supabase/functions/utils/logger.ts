import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export interface ApiLogData {
  user_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  platform?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  error_message?: string;
  request_duration_ms: number;
}

/**
 * Log API request to database (fire-and-forget, doesn't block response)
 */
export async function logApiRequest(data: ApiLogData): Promise<void> {
  // Fire-and-forget logging - don't wait for completion
  try {
    const { error } = await supabase.from("api_logs").insert([data]);

    if (error) {
      console.error("Failed to log API request:", error);
    }
  } catch (err) {
    // Silently fail - logging should never crash the API
    console.error("Error logging API request:", err);
  }
}
