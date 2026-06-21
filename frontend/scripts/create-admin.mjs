/**
 * One-time script to create the first admin user.
 * Run from the frontend/ directory:
 *
 *   node scripts/create-admin.mjs <phone> <password>
 *
 * Example:
 *   node scripts/create-admin.mjs 9876543210 MyPassword123
 *
 * Phone should be 10 digits (no country code, no +91).
 * After running, log in at /admin/login with that phone + password.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local manually (process.env won't have it without dotenv)
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

const [, , phone, password] = process.argv;

if (!phone || !password) {
  console.error('Usage: node scripts/create-admin.mjs <10-digit-phone> <password>');
  process.exit(1);
}

if (!/^\d{10}$/.test(phone)) {
  console.error('ERROR: Phone must be exactly 10 digits, no country code (e.g. 9876543210)');
  process.exit(1);
}

if (password.length < 8) {
  console.error('ERROR: Password must be at least 8 characters');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `${phone}@admin.paavan.internal`;

console.log(`Creating admin user for phone ${phone} ...`);

// 1. Create the auth user
const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createError) {
  console.error('ERROR creating auth user:', createError.message);
  process.exit(1);
}

const userId = created.user.id;
console.log(`Auth user created: ${userId}`);

// 2. The trigger inserts a public.users row with phone = '' (because the
//    auth user was created with an email identity, not a phone identity).
//    Update the row to set the real phone and promote to admin.
const { error: updateError } = await supabase
  .from('users')
  .update({ role: 'admin', phone })
  .eq('id', userId);

if (updateError) {
  console.error('ERROR updating user role:', updateError.message);
  console.error('The auth user was created but role was not set. Run this SQL manually in Supabase:');
  console.error(`  UPDATE public.users SET role = 'admin', phone = '${phone}' WHERE id = '${userId}';`);
  process.exit(1);
}

console.log('');
console.log('✓ Admin user created successfully!');
console.log(`  Phone    : ${phone}`);
console.log(`  Password : (what you entered)`);
console.log(`  Login at : http://localhost:3000/admin/login`);
