interface NotifyResult {
  delivered: boolean;
  reason?: string;
}

function isConfigured() {
  return Boolean(process.env.INTERAKT_API_KEY);
}

// Sends a free-form WhatsApp message (deposit refund/withhold notices,
// waitlist restock pings). Degrades to a console log when Interakt isn't
// configured yet, so the rest of the app never has to special-case it.
export async function sendWhatsApp(phone: string, message: string): Promise<NotifyResult> {
  if (!isConfigured()) {
    console.log(`[whatsapp] not configured — would send to ${phone}: ${message}`);
    return { delivered: false, reason: 'not_configured' };
  }

  const res = await fetch('https://api.interakt.ai/v1/public/message/', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      countryCode: '+91',
      phoneNumber: phone,
      type: 'Text',
      data: { message },
    }),
  });

  if (!res.ok) {
    console.error(`[whatsapp] send failed for ${phone}: ${res.status}`);
    return { delivered: false, reason: `http_${res.status}` };
  }
  return { delivered: true };
}

// Sends a numeric OTP via SMS (MSG91). Same graceful-degradation pattern —
// logs the code to the server console when MSG91 isn't configured, which
// is exactly what local/dev testing needs before DLT registration clears.
export async function sendOTP(phone: string, code: string): Promise<NotifyResult> {
  if (!process.env.MSG91_API_KEY) {
    console.log(`[otp] MSG91 not configured — OTP for ${phone} is ${code}`);
    return { delivered: false, reason: 'not_configured' };
  }

  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      authkey: process.env.MSG91_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile: `91${phone}`,
      otp: code,
      template_id: process.env.MSG91_OTP_TEMPLATE_ID,
    }),
  });

  if (!res.ok) {
    console.error(`[otp] MSG91 send failed for ${phone}: ${res.status}`);
    return { delivered: false, reason: `http_${res.status}` };
  }
  return { delivered: true };
}

// Sends a plain informational SMS (Aadhaar rejection notices, etc.) via
// MSG91's general send API — distinct from the OTP-specific endpoint
// above. Same graceful-degradation pattern.
export async function sendSMS(phone: string, message: string): Promise<NotifyResult> {
  if (!process.env.MSG91_API_KEY) {
    console.log(`[sms] MSG91 not configured — would send to ${phone}: ${message}`);
    return { delivered: false, reason: 'not_configured' };
  }

  const res = await fetch('https://control.msg91.com/api/v5/flow', {
    method: 'POST',
    headers: {
      authkey: process.env.MSG91_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobiles: `91${phone}`,
      message,
    }),
  });

  if (!res.ok) {
    console.error(`[sms] MSG91 send failed for ${phone}: ${res.status}`);
    return { delivered: false, reason: `http_${res.status}` };
  }
  return { delivered: true };
}
