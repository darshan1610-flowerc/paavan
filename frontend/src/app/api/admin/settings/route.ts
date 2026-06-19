import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { settingsUpdateSchema } from '@/lib/schemas/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { SETTINGS_DEFAULTS } from '@/lib/server/settings';

const KEY_MAP: Record<string, string> = {
  platformFee: 'platform_fee',
  depositAmount: 'deposit_amount',
  waitlistAdvance: 'waitlist_advance',
  termsAndConditions: 'terms_and_conditions',
  pickupLocations: 'pickup_locations',
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    // app_settings has no client-facing RLS policy — service-role only.
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('app_settings').select('key, value');
    if (error) throw error;

    const settings = { ...SETTINGS_DEFAULTS };
    for (const row of data ?? []) {
      const camelKey = Object.entries(KEY_MAP).find(([, v]) => v === row.key)?.[0];
      if (camelKey) (settings as Record<string, unknown>)[camelKey] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAdmin(req);
    const body = await validateBody(settingsUpdateSchema, req);
    const supabase = createAdminClient();

    const updates = Object.entries(body).filter(([, v]) => v !== undefined);
    for (const [camelKey, value] of updates) {
      const dbKey = KEY_MAP[camelKey];
      if (!dbKey) continue;
      await supabase.from('app_settings').upsert({
        key: dbKey,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
