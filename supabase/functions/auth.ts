import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const base_url =
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL') || 'http://localhost:54321';
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

export async function getCurrentUser(req: Request): Promise<any> {
  const authHeader =
    req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const token = authHeader.substring(7);
  const { data: user, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid token or user not found');
  }

  return user;
}
