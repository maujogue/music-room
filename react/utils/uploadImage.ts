import { supabase } from '@/services/supabase';

export async function uploadImageToSupabase(
  uri: string,
  bucket: string,
  folder: string
): Promise<string> {
  const arraybuffer = await fetch(uri).then(res => res.arrayBuffer());

  const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const path = `${folder}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, arraybuffer, {
      contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`, // Simple content type inference
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
