import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';
import { getSignedUrl } from '@/lib/server/storage';

// [id] is a deposits.id. Returns a 60-minute signed URL for the return
// video — never a permanent/public URL.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireAdmin(req);

    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('return_video_path')
      .eq('id', id)
      .single();

    if (error || !deposit?.return_video_path) {
      return NextResponse.json({ error: 'No return video on file' }, { status: 404 });
    }

    const url = await getSignedUrl('return-videos', deposit.return_video_path, 3600);
    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
