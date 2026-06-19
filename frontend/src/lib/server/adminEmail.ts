// Supabase requires a paid SMS provider (Twilio etc.) configured before
// it'll enable phone-based auth at all, even if we never send a real OTP
// through it. To avoid that dependency, admin accounts are stored in
// Supabase Auth as email identities using a synthetic, never-emailed
// address derived from the phone number — the login screen still only
// ever shows/asks for a phone number.
export function phoneToInternalEmail(phone: string) {
  return `${phone}@admin.paavan.internal`;
}
