require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function run() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error('SUPABASE_URL and SUPABASE_KEY are required in backend/.env for this test.');
      return;
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching bookings...');
    const resBookings = await fetch('http://localhost:5000/api/bookings');
    const bookings = await resBookings.json();
    console.log('Bookings count:', bookings.length);
    if (!bookings || bookings.length === 0) {
      console.log('No bookings found in the database. Please make a booking from the frontend first.');
      return;
    }
    const latestBooking = bookings[0];
    console.log('Latest booking details:');
    console.log('  ID:', latestBooking.id);
    console.log('  Total Paid:', latestBooking.total_paid);
    console.log('  Payment ID (before):', latestBooking.payment_id);

    console.log('\nTesting /api/payment/create-order...');
    const resOrder = await fetch('http://localhost:5000/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: latestBooking.id,
        amount: latestBooking.total_paid
      })
    });
    console.log('Order status:', resOrder.status);
    const orderRawText = await resOrder.text();
    const orderData = JSON.parse(orderRawText);
    console.log('Created Order response:', orderData);

    console.log('\nTesting /api/payment/verify...');
    const resVerify = await fetch('http://localhost:5000/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: latestBooking.id,
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: `pay_mock_test_${Date.now()}`,
        razorpay_signature: 'mock_signature_bypass'
      })
    });
    console.log('Verify status:', resVerify.status);
    const verifyData = JSON.parse(await resVerify.text());
    console.log('Verification response:', verifyData);

    // Fetch user phone to test user bookings fetch
    console.log('\nLooking up user details...');
    const { data: userRow } = await supabase
      .from('users')
      .select('phone')
      .eq('id', latestBooking.user_id)
      .single();
    
    if (userRow) {
      console.log(`User phone: ${userRow.phone}`);
      console.log(`Testing /api/bookings/user/:phone...`);
      const resUserRides = await fetch(`http://localhost:5000/api/bookings/user/${userRow.phone}`);
      const userRidesData = await resUserRides.json();
      console.log('User bookings fetch status:', resUserRides.status);
      console.log('Active ride bike:', userRidesData.bookings?.find(b => b.status === 'active')?.bike?.name || 'none');
    }

    // Reset deposit status to 'held' in database first to ensure return video can be uploaded
    console.log('\nResetting deposit status to held to test return video upload...');
    await supabase
      .from('deposits')
      .update({ status: 'held', return_video_path: null, submitted_at: null })
      .eq('booking_id', latestBooking.id);

    // Test deposits return video upload
    console.log('\nTesting /api/deposits/submit-return...');
    const formData = new FormData();
    formData.append('bookingId', latestBooking.id);
    const dummyBlob = new Blob(['dummy mp4 content'], { type: 'video/mp4' });
    formData.append('video', dummyBlob, 'test_return.mp4');

    const resSubmit = await fetch('http://localhost:5000/api/deposits/submit-return', {
      method: 'POST',
      body: formData
    });
    console.log('Upload status:', resSubmit.status);
    const submitData = await resSubmit.json();
    console.log('Upload response:', submitData);

    // Check final status
    const { data: depositAfter } = await supabase
      .from('deposits')
      .select('status, return_video_path')
      .eq('booking_id', latestBooking.id)
      .single();
    console.log('\nVerification of database upload:');
    console.log('  Deposit status in database:', depositAfter?.status);
    console.log('  Video path in database:', depositAfter?.return_video_path);

  } catch (err) {
    console.error('Error during API test:', err);
  }
}
run();
