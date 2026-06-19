import { createAdminClient } from '@/lib/supabase/admin';

// Mints a short-lived signed URL for a private storage object. Callers
// never receive or cache a raw path — only ever this URL, valid for
// `expiresIn` seconds (60 minutes by default, per the Aadhaar/return-video
// requirement that nothing is ever served via a permanent public URL).
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new Error(`Failed to sign URL for ${bucket}/${path}: ${error?.message}`);
  }
  return data.signedUrl;
}
