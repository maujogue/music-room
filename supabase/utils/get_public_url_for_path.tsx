import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.34.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SECRET_SERVICE_ROLE_KEY')!
);

export default async function getPublicUrlForPath(path: string): string {
  const localUrl = Deno.env.get('EXPO_PUBLIC_SUPABASE_URL');

  const { data } = supabase.storage.from('avatars').createSignedUrl(path, 3600);

  if (data?.publicUrl) {
    const publicUrl = data.publicUrl.replace(
      'http://kong:8000/storage/v1',
      localUrl + '/storage/v1'
    );
    console.log('Public URL:', publicUrl);
    return publicUrl;
  }

  const { data: signedData, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, 3600);

  if (error) {
    console.error('createSignedUrl error', error);
    throw error;
  }

  const correctedUrl = signedData?.signedUrl?.replace(
    'http://kong:8000/storage/v1',
    localUrl + '/storage/v1'
  ) || path;

  return correctedUrl;
}
