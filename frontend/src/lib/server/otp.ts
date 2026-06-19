import { createHash, randomInt } from 'crypto';

export function generateOTP() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOTP(otp: string) {
  return createHash('sha256').update(otp).digest('hex');
}
