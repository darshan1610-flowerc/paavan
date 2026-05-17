# PAAVAN GO ELECTRIC

Welcome to the **PAAVAN GO ELECTRIC** application! This project consists of a React frontend and a Node.js/Express backend. 

## Prerequisites

Before you can run this application, you must install **Node.js**. Node.js includes `npm` (Node Package Manager), which is required to install dependencies and run the servers.
- Download and install Node.js from: [https://nodejs.org/](https://nodejs.org/)

---

## 1. Running the Backend (API Server)

The backend is built with Node.js and Express. It handles the booking submissions.

1. Open your terminal or command prompt.
2. Navigate to the `backend` directory:
   ```bash
   cd c:\Users\HP\Desktop\Paavan\backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *(Alternatively, you can run `npm start`)*

The backend server will start running at **http://localhost:5000**.
*Note: By default, the API will use an in-memory array to store bookings so you can test it immediately. If you want to connect it to a real PostgreSQL/Supabase database, set the `DATABASE_URL` environment variable before running.*

---

## 2. Running the Frontend (Web Interface)

The frontend is built using React, Vite, and Tailwind CSS.

1. Open a **new** terminal or command prompt (keep the backend server running in the first one).
2. Navigate to the `frontend` directory:
   ```bash
   cd c:\Users\HP\Desktop\Paavan\frontend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend server will start, typically at **http://localhost:5173**. 
You can open this URL in your web browser to view the website.

---

## 3. Testing the Application

Once both the frontend and backend are running:
1. Open your browser and navigate to `http://localhost:5173`.
2. Browse the home page and click **"RESERVE NOW"** or any of the plan selection buttons.
3. You will be routed to the **`/booking`** page.
4. Fill out the form with your details, select a date, time, and location, and click **"Confirm Reservation"**.
5. The frontend will communicate with the backend on port `5000` to submit your booking.
6. You will see a success message on the screen!

## Project Structure

- `/frontend` - Contains the Vite/React application, Tailwind CSS configuration, and all UI components.
- `/backend` - Contains the Express server and API endpoints (`server.js`).
