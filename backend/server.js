const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection (PostgreSQL/Supabase)
// If DATABASE_URL is not provided, we will use an in-memory array for demo purposes
const dbUrl = process.env.DATABASE_URL;
let pool;

if (dbUrl) {
  pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  console.log('PostgreSQL database configured.');
} else {
  console.log('No DATABASE_URL provided. Using in-memory storage for demo.');
}

const inMemoryBookings = [];

// REST API endpoint to create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, plan, location, date, time } = req.body;
    
    // Simple validation
    if (!name || !email || !plan || !location || !date || !time) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newBooking = {
      id: Date.now().toString(),
      name,
      email,
      plan,
      location,
      date,
      time,
      created_at: new Date().toISOString()
    };

    if (pool) {
      // Use PostgreSQL if configured
      const query = `
        INSERT INTO bookings (name, email, plan, location, date, time) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `;
      const values = [name, email, plan, location, date, time];
      const result = await pool.query(query, values);
      return res.status(201).json({ message: 'Booking successful', booking: result.rows[0] });
    } else {
      // Fallback to in-memory
      inMemoryBookings.push(newBooking);
      return res.status(201).json({ message: 'Booking successful (in-memory)', booking: newBooking });
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to fetch all bookings (for testing)
app.get('/api/bookings', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.json(inMemoryBookings);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
