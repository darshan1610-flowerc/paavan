import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError, ValidationError } from '@/lib/server/errors';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

// bike-images is a public bucket (bike photos are shown on the public
// site) but uploads still go through this admin-only route so only an
// authenticated admin can ever write into it.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new ValidationError({ file: ['No file provided'] });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError({ file: ['Only JPEG, PNG, or WebP images are allowed'] });
    }
    if (file.size > MAX_BYTES) {
      throw new ValidationError({ file: ['Image must be 5MB or smaller'] });
    }

    const ext = file.type.split('/')[1];
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createAdminClient();
    const { error } = await supabase.storage.from('bike-images').upload(path, buffer, {
      contentType: file.type,
    });
    if (error) throw error;

    const { data: publicUrl } = supabase.storage.from('bike-images').getPublicUrl(path);

    return NextResponse.json({ path, url: publicUrl.publicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
