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

function formatPhoneForTwilio(phone: string): string {
  let formatted = phone.trim();
  if (formatted.length === 10 && !formatted.startsWith('+')) {
    formatted = '+91' + formatted;
  } else if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  return formatted;
}

// Sends a numeric OTP via SMS. First tries Twilio if configured, then falls back to MSG91, 
// and finally defaults to a console log.
export async function sendOTP(phone: string, code: string): Promise<NotifyResult> {
  const message = `Your PAAVAN login OTP is ${code}. It is valid for 5 minutes.`;

  // 1. Try Twilio if credentials are provided
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const formattedPhone = formatPhoneForTwilio(phone);
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[otp] Twilio send failed:', errorData);
        return { delivered: false, reason: `twilio_error_${res.status}` };
      }
      console.log(`[otp] Sent OTP via Twilio to ${formattedPhone}`);
      return { delivered: true };
    } catch (error) {
      console.error('[otp] Twilio exception:', error);
      return { delivered: false, reason: 'twilio_exception' };
    }
  }

  // 2. Fallback to MSG91 if configured
  if (process.env.MSG91_API_KEY) {
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

  // 3. Graceful fallback for local development
  console.log(`[otp] No SMS provider configured — OTP for ${phone} is ${code}`);
  return { delivered: false, reason: 'not_configured' };
}

// Sends a plain informational SMS (Aadhaar rejection notices, etc.). 
// First tries Twilio if configured, then falls back to MSG91, and finally defaults to a console log.
export async function sendSMS(phone: string, message: string): Promise<NotifyResult> {
  // 1. Try Twilio if credentials are provided
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const formattedPhone = formatPhoneForTwilio(phone);
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[sms] Twilio send failed:', errorData);
        return { delivered: false, reason: `twilio_error_${res.status}` };
      }
      console.log(`[sms] Sent SMS via Twilio to ${formattedPhone}`);
      return { delivered: true };
    } catch (error) {
      console.error('[sms] Twilio exception:', error);
      return { delivered: false, reason: 'twilio_exception' };
    }
  }

  // 2. Fallback to MSG91 if configured
  if (process.env.MSG91_API_KEY) {
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

  // 3. Graceful fallback for local development
  console.log(`[sms] No SMS provider configured — would send to ${phone}: ${message}`);
  return { delivered: false, reason: 'not_configured' };
}
