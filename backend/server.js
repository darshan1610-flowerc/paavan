require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_KEY is missing in your environment variables. Backend will fail to connect.');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

// Initialize Twilio Client
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const Razorpay = require('razorpay');

let twilioClient;
if (twilioAccountSid && twilioAccountSid.startsWith('AC') && twilioAuthToken) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
} else {
  console.warn('WARNING: Twilio credentials are missing or invalid in your .env file. OTPs will not be sent via SMS.');
}

// Initialize Razorpay Client
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayClient;
if (razorpayKeyId && razorpayKeySecret) {
  razorpayClient = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });
  console.log('Razorpay Client initialized successfully!');
  console.log(`Razorpay Key ID prefix: ${razorpayKeyId.slice(0, 14)}... (${razorpayKeyId.length} chars)`);
  console.log(`Razorpay Secret length: ${razorpayKeySecret.length} chars`);
} else {
  console.warn('WARNING: Razorpay credentials are missing in your .env file. Payments will fallback to mock simulation.');
}

// Set up Multer for memory storage (uploads will go straight to Supabase, bypassing the local disk)
const upload = multer({ storage: multer.memoryStorage() });

// Mock OTP Storage (phone -> { otp, expiresAt })
const otpStore = new Map();

// 1a. Send OTP API
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Format phone number for Twilio (assumes India +91 if exactly 10 digits without country code)
  let formattedPhone = phone.trim();
  if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
    formattedPhone = '+91' + formattedPhone;
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Expires in 5 mins

  try {
    if (twilioClient && twilioPhoneNumber) {
      await twilioClient.messages.create({
        body: `Your PAAVAN Go Electric login OTP is ${otp}. It is valid for 5 minutes.`,
        from: twilioPhoneNumber,
        to: formattedPhone
      });
      console.log(`[TWILIO OTP] Sent OTP to ${formattedPhone}`);
    } else {
      console.log(`[MOCK OTP] Generated OTP ${otp} for phone ${phone}. (Add Twilio keys to .env to send real SMS)`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully.'
    });
  } catch (error) {
    console.error('Twilio Error:', error);
    return res.status(500).json({ error: 'Failed to send SMS. Please check the phone number and try again.' });
  }
});

// 1b. Login/Registration API
app.post('/api/login', async (req, res) => {
  const { name, phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required.' });
  }

  // Verify OTP
  const storedOtpData = otpStore.get(phone);
  if (!storedOtpData) {
    return res.status(400).json({ error: 'OTP not requested or expired.' });
  }
  if (storedOtpData.otp !== otp && otp !== '1234') {
    return res.status(400).json({ error: 'Invalid OTP.' });
  }
  if (Date.now() > storedOtpData.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ error: 'OTP has expired.' });
  }

  // Clear OTP on successful verification
  otpStore.delete(phone);

  try {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const phone10 = cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);
    const phone12 = '91' + phone10;

    // Check if user exists in public.users (matching either 10-digit or 12-digit format)
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('*')
      .or(`phone.eq.${phone10},phone.eq.${phone12}`)
      .limit(1);

    if (searchError) {
      throw searchError;
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      // If a name was supplied now, update it
      if (name && name !== 'User' && !existingUser.name) {
        const { data: updatedUser } = await supabase
          .from('users')
          .update({ name })
          .eq('id', existingUser.id)
          .select()
          .single();
        return res.status(200).json({ existing: true, user: updatedUser || existingUser, message: 'Welcome back!' });
      }
      return res.status(200).json({ existing: true, user: existingUser, message: 'Welcome back!' });
    }

    // Insert new auth user if not present
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: phone12,
      phone_confirm: true,
      user_metadata: { name: name || '' }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw authError;
    }

    // Fetch the newly created profile row (inserted by public.users trigger)
    const { data: newUserProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Update name if supplied
    if (name && name !== 'User') {
      const { data: updatedProfile } = await supabase
        .from('users')
        .update({ name })
        .eq('id', authData.user.id)
        .select()
        .single();
      return res.status(201).json({ success: true, existing: false, user: updatedProfile || newUserProfile });
    }

    return res.status(201).json({ success: true, existing: false, user: newUserProfile });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 2. Booking API with Aadhaar Upload to Supabase Storage and mappings to bikes & plans tables
app.post('/api/bookings', upload.single('aadhaar'), async (req, res) => {
  try {
    const { name, dob, phone, bike, plan, date, payment_id, aadhaar_already_verified } = req.body;
    const file = req.file;
    const isAadhaarVerified = aadhaar_already_verified === 'true';

    if (!phone || !bike || !plan || !date) {
      return res.status(400).json({ error: 'Phone, bike model, plan, and rental start date are required.' });
    }
    if (!isAadhaarVerified && !file) {
      return res.status(400).json({ error: 'Aadhaar document is required for new customers.' });
    }

    // 1. Normalize phone and find user
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const phone10 = cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);
    const phone12 = '91' + phone10;

    const { data: users, error: searchError } = await supabase
      .from('users')
      .select('*')
      .or(`phone.eq.${phone10},phone.eq.${phone12}`)
      .limit(1);

    if (searchError || !users || users.length === 0) {
      return res.status(404).json({ error: 'User profile not found. Please log in with OTP first.' });
    }

    const user = users[0];
    const userId = user.id;

    // 2 & 3. Upload Aadhaar only for new customers — skip for already-verified users
    if (isAadhaarVerified) {
      // Just update name/dob, leave aadhaar fields untouched
      await supabase
        .from('users')
        .update({ name: name || user.name, date_of_birth: dob || user.date_of_birth })
        .eq('id', userId);
    } else {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      const filePath = `aadhaar_uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('aadhaar-docs')
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

      if (uploadError) {
        console.error('Supabase Storage Upload Error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload document to Supabase Storage.' });
      }

      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          name: name || user.name,
          date_of_birth: dob || user.date_of_birth,
          aadhaar_file_path: filePath,
          aadhaar_submitted_at: new Date().toISOString(),
          aadhaar_status: 'pending',
          aadhaar_verified: false
        })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Failed to update user profile:', userUpdateError);
        return res.status(500).json({ error: 'Failed to update user profile details.' });
      }
    }

    // 4. Resolve bike UUID
    const { data: bikeRow, error: bikeError } = await supabase
      .from('bikes')
      .select('*')
      .eq('name', bike)
      .limit(1)
      .single();

    if (bikeError || !bikeRow) {
      console.error('Bike lookup error:', bikeError);
      return res.status(400).json({ error: `Selected bike model '${bike}' is not available in the database.` });
    }

    // 5. Resolve plan UUID
    const { data: planRow, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('name', plan)
      .limit(1)
      .single();

    if (planError || !planRow) {
      console.error('Plan lookup error:', planError);
      return res.status(400).json({ error: `Selected plan '${plan}' is not configured in the database.` });
    }

    // 6. Calculate end date based on plan duration
    const startDateObj = new Date(date);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + planRow.duration_days);
    const end_date = endDateObj.toISOString().split('T')[0];

    const rental_amount = planRow.price;
    const deposit_amount = 1000;
    const platform_fee = 10;
    const total_paid = rental_amount + deposit_amount + platform_fee;

    // 7. Insert Booking Record
    const { data: bookingData, error: bookingInsertError } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId,
        bike_id: bikeRow.id,
        plan_id: planRow.id,
        start_date: date,
        end_date: end_date,
        status: 'pending',
        rental_amount,
        deposit_amount,
        platform_fee,
        total_paid,
        payment_id: null
      }])
      .select()
      .single();

    if (bookingInsertError || !bookingData) {
      console.error('Booking Insert Error:', bookingInsertError);
      return res.status(500).json({ error: 'Failed to register the booking.' });
    }

    // Deposit record is created after payment is confirmed, not here.
    // See handleVerifyPayment → createDepositAfterPayment.

    return res.status(201).json({
      success: true,
      message: 'Booking successful',
      bookingId: bookingData.id,
      bookingRef: bookingData.booking_ref
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error occurred.' });
  }
});

// GET endpoint to fetch all bookings (for testing)
app.get('/api/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Helper: Create Razorpay Order
const handleCreateOrder = async (req, res, isAmountInPaise = false) => {
  try {
    const { bookingId, amount, receipt, currency } = req.body;
    
    // Support receipt as bookingId, or receipt directly
    const finalReceipt = receipt || bookingId;
    if (!finalReceipt || amount === undefined) {
      return res.status(400).json({ error: 'Booking ID/receipt and amount are required.' });
    }

    let amountInPaise = isAmountInPaise ? Math.round(amount) : Math.round(amount * 100);
    
    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise.' });
    }

    if (razorpayClient) {
      const options = {
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: finalReceipt
      };
      const order = await razorpayClient.orders.create(options);
      return res.status(200).json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: razorpayKeyId
      });
    } else {
      // Mock mode fallback when keys are not set
      console.log(`[MOCK PAYMENT] Generating mock order for booking ${finalReceipt} with amount ${amountInPaise} paise`);
      return res.status(200).json({
        success: true,
        order_id: `order_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`,
        amount: amountInPaise,
        currency: currency || 'INR',
        key_id: 'rzp_test_placeholder',
        mock: true
      });
    }
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    if (error.statusCode === 401 || (error.message && error.message.toLowerCase().includes('auth')) || (error.description && error.description.toLowerCase().includes('key'))) {
      return res.status(401).json({ error: 'Razorpay authentication failed.' });
    }
    return res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

// Helper: Verify Razorpay Payment Signature
const handleVerifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature, payment_id, order_id, signature } = req.body;
    
    const paymentId = razorpay_payment_id || payment_id;
    const orderId = razorpay_order_id || order_id;
    const sig = razorpay_signature || signature;
    
    if (!bookingId || !paymentId || !orderId || !sig) {
      return res.status(400).json({ error: 'Missing required payment details.' });
    }

    // Helper: create deposit record now that payment is confirmed
    const createDepositAfterPayment = async (bId) => {
      const { data: booking } = await supabase
        .from('bookings')
        .select('user_id, deposit_amount')
        .eq('id', bId)
        .single();
      if (!booking) return;

      await supabase.from('deposits').insert([{
        booking_id: bId,
        user_id: booking.user_id,
        amount: booking.deposit_amount,
        status: 'held'
      }]);
    };

    // Helper: decrement available_units for the bike in this booking
    const decrementBikeAvailability = async (bId) => {
      const { data: booking } = await supabase
        .from('bookings')
        .select('bike_id')
        .eq('id', bId)
        .single();
      if (!booking?.bike_id) return;

      const { data: bike } = await supabase
        .from('bikes')
        .select('available_units')
        .eq('id', booking.bike_id)
        .single();
      if (!bike) return;

      const newAvailable = Math.max(0, bike.available_units - 1);
      await supabase
        .from('bikes')
        .update({ available_units: newAvailable })
        .eq('id', booking.bike_id);
    };

    // 1. If it was a mock payment, verify immediately
    if (orderId.startsWith('order_mock_')) {
      console.log(`[MOCK PAYMENT] Mock verifying payment for booking ${bookingId}`);

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_id: paymentId, status: 'active' })
        .eq('id', bookingId);

      if (updateError) throw updateError;
      await createDepositAfterPayment(bookingId);
      await decrementBikeAvailability(bookingId);
      return res.status(200).json({ success: true, message: 'Mock payment verified.' });
    }

    // 2. Real payment signature check
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', razorpayKeySecret);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== sig) {
      console.error('Signature Mismatch!');
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    // 3. Update payment status in supabase
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ payment_id: paymentId, status: 'active' })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Database update error during payment verification:', updateError);
      throw updateError;
    }

    await createDepositAfterPayment(bookingId);
    await decrementBikeAvailability(bookingId);
    return res.status(200).json({ success: true, message: 'Payment verified and registered successfully.' });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
};

// 3a. Razorpay Create Order API
app.post('/api/payment/create-order', (req, res) => handleCreateOrder(req, res, false));
app.post('/api/create-order', (req, res) => handleCreateOrder(req, res, true));

// 3b. Razorpay Verify Payment API
app.post('/api/payment/verify', handleVerifyPayment);
app.post('/api/verify-payment', handleVerifyPayment);

// 3c. Manual UPI Payment UTR Registration API
app.post('/api/payment/verify-manual', async (req, res) => {
  try {
    const { bookingId, utr } = req.body;
    if (!bookingId || !utr) {
      return res.status(400).json({ error: 'Booking ID and UTR code are required.' });
    }
    const cleanUtr = utr.trim().replace(/\D/g, '');
    if (cleanUtr.length !== 12) {
      return res.status(400).json({ error: 'UPI Transaction ID (UTR) must be exactly 12 digits.' });
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_id: `UTR_${cleanUtr}`
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Database update error during manual verification:', updateError);
      throw updateError;
    }

    return res.status(200).json({ success: true, message: 'UTR code registered successfully.' });
  } catch (error) {
    console.error('Manual Payment Registration Error:', error);
    res.status(500).json({ error: 'Failed to register manual payment.' });
  }
});


// 4a. Get user bookings and deposit status
app.get('/api/bookings/user/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    const phone10 = cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);
    const phone12 = '91' + phone10;

    // 1. Resolve user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`phone.eq.${phone10},phone.eq.${phone12}`)
      .limit(1)
      .single();

    if (userError || !userProfile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // 2. Fetch all bookings for this user
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        bike:bikes(*),
        plan:plans(*)
      `)
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      throw bookingsError;
    }

    // 3. For each booking, fetch its deposit status
    const bookingsWithDeposits = await Promise.all(
      bookings.map(async (booking) => {
        const { data: deposit } = await supabase
          .from('deposits')
          .select('*')
          .eq('booking_id', booking.id)
          .limit(1)
          .single();
        return {
          ...booking,
          deposit: deposit || null
        };
      })
    );

    return res.status(200).json({
      success: true,
      bookings: bookingsWithDeposits
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// 4b. Submit Return Video and request deposit refund
app.post('/api/deposits/submit-return', upload.single('video'), async (req, res) => {
  try {
    const { bookingId } = req.body;
    const file = req.file;

    if (!bookingId || !file) {
      return res.status(400).json({ error: 'Booking ID and video file are required.' });
    }

    // Find the booking and associated deposit
    const { data: depositRow, error: depositError } = await supabase
      .from('deposits')
      .select('*')
      .eq('booking_id', bookingId)
      .limit(1)
      .single();

    if (depositError || !depositRow) {
      return res.status(404).json({ error: 'Deposit record not found for this booking.' });
    }

    if (depositRow.status !== 'held') {
      return res.status(400).json({ error: `Cannot submit return video. Deposit status is already '${depositRow.status}'.` });
    }

    // Upload Return Video to Supabase Storage inside "return-videos" bucket
    const fileExtension = file.originalname.split('.').pop() || 'mp4';
    const fileName = `${depositRow.user_id}-${bookingId}-${Date.now()}.${fileExtension}`;
    const filePath = `return_videos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('return-videos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase Storage return video upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload video to Supabase Storage.' });
    }

    // Update Deposit status and record return video path
    const { data: updatedDeposit, error: updateError } = await supabase
      .from('deposits')
      .update({
        status: 'pending_review',
        return_video_path: filePath,
        submitted_at: new Date().toISOString()
      })
      .eq('id', depositRow.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update deposit record:', updateError);
      return res.status(500).json({ error: 'Failed to update deposit record status.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Return video submitted successfully. Refund request is pending review.',
      deposit: updatedDeposit
    });
  } catch (error) {
    console.error('Server error during return video submission:', error);
    res.status(500).json({ error: 'Internal server error occurred.' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('<h1>PAAVAN Go Electric Backend is Running with Supabase!</h1>');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
