import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'

export async function createEvent(c: Context): Promise<any> {
  const body = await c.req.json()

  if (!body.name || body.name.length < 3) {
    throw new HTTPException(400, { message: 'Event name must be at least 3 characters long' })
  }

  const user = c.get('user')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
}

