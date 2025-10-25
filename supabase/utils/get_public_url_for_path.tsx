import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.34.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// This function is for developing locally with the Supabase emulator
export default async function getPublicUrlForPath(path: string): Promise<string> {
  const localUrl = "http://10.0.2.2:54321";

  const { data: signedData, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, 3600);

  console.log('createSignedUrl result:', signedData, error);
  if (error) {
    console.error('createSignedUrl error', error);
    throw error;
  }

  const correctedUrl = signedData?.signedUrl?.replace(
    'http://kong:8000/storage/v1',
    localUrl + '/storage/v1'
  ) || path;

  console.log('localUrl:', localUrl);
  console.log('getPublicUrlForPath result:', correctedUrl);
  return correctedUrl;
}
