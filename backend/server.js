require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

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

// Set up Multer for memory storage (uploads will go straight to Supabase, bypassing the local disk)
const upload = multer({ storage: multer.memoryStorage() });

// 1. Login/Registration API
app.post('/api/login', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  try {
    // Check if user exists
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is perfectly fine here.
      throw searchError;
    }

    if (existingUser) {
      return res.status(200).json({ existing: true, message: 'User already exists in Supabase. Proceeding to login.' });
    }

    // Insert new user
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ name, phone }]);

    if (insertError) throw insertError;

    return res.status(201).json({ success: true, message: 'User registered successfully to Supabase.' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Booking API with Aadhaar Upload to Supabase Storage
app.post('/api/bookings', upload.single('aadhaar'), async (req, res) => {
  try {
    const { name, email, plan, location, date, time } = req.body;
    const file = req.file;
    
    if (!name || !email || !plan || !location || !date || !time || !file) {
      return res.status(400).json({ error: 'All fields and Aadhaar card document are required.' });
    }

    // 1. Upload File to Supabase Storage
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    const filePath = `aadhaar_uploads/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents') // The Supabase Storage Bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage Error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload document to Supabase Storage.' });
    }

    // 2. Get Public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const documentUrl = publicUrlData.publicUrl;

    // 3. Insert Booking Record to Supabase Database
    const { error: insertError } = await supabase
      .from('bookings')
      .insert([{
        name,
        email,
        plan,
        location,
        date,
        time,
        aadhaar_document_url: documentUrl
      }]);

    if (insertError) {
      console.error('Database Insert Error:', insertError);
      return res.status(500).json({ error: 'Failed to save booking to database.' });
    }

    return res.status(201).json({ message: 'Booking successful', documentUrl });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

app.get('/', (req, res) => {
  res.send('<h1>PAAVAN Go Electric Backend is Running with Supabase!</h1>');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
