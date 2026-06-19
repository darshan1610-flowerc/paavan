import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';
import { getSignedUrl } from '@/lib/server/storage';

// [id] is a users.id. Returns a 60-minute signed URL for their Aadhaar
// file — never a permanent/public URL, and only ever minted on demand
// for an authenticated admin.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireAdmin(req);

    const { data: user, error } = await supabase
      .from('users')
      .select('aadhaar_file_path')
      .eq('id', id)
      .single();

    if (error || !user?.aadhaar_file_path) {
      return NextResponse.json({ error: 'No Aadhaar document on file' }, { status: 404 });
    }

    const url = await getSignedUrl('aadhaar-docs', user.aadhaar_file_path, 3600);
    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
