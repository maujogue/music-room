import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';


const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SECRET_SERVICE_ROLE_KEY')!
);

export async function getCurrentUser(req: Request): Promise<any> {
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Authorization header or invalid format');
    throw new HTTPException(401, {
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data) {
    const errorResponse = new Response('Failed to fetch user data', {
      status: 401,
    });
    throw new HTTPException(401, { res: errorResponse });
  }

  return data.user;
}

export async function getUserToken(user_id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id);

  if (error || !data) {
    const errorResponse = new Response('Failed to fetch user data', {
      status: 500,
    });
    throw new HTTPException(500, { res: errorResponse });
  }

  return data[0].spotify_access_token;
}
