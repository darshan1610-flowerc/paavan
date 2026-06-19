import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const { count } = await supabase
      .from('deposits')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_review');

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    return handleApiError(error);
  }
}
