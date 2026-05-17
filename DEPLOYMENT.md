# Deployment Guide: PAAVAN GO ELECTRIC

Deploying this full-stack application involves three main steps: setting up a live database, deploying the Node.js backend, and deploying the React frontend. 

Here is the recommended step-by-step path using the best free-tier tools available today: **Supabase** (Database), **Render** (Backend), and **Vercel** (Frontend).

---

## Step 1: Set up the Database (Supabase)

Supabase provides a free, managed PostgreSQL database.

1. **Create an account:** Go to [supabase.com](https://supabase.com/) and sign up.
2. **Create a project:** Click "New Project", give it a name (e.g., `paavan-db`), and set a secure database password. Wait a few minutes for the database to provision.
3. **Get the Connection String:**
   - Go to your Project Settings (the gear icon) -> **Database**.
   - Scroll down to the **Connection string** section.
   - Select **URI**. It will look something like this: `postgresql://postgres.[your-project-ref]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
   - Copy this URI and save it somewhere safe. *Remember to replace `[YOUR-PASSWORD]` with the password you created in step 2.*
4. **Create the Table:**
   - In the Supabase sidebar, go to the **SQL Editor**.
   - Paste and run the following SQL command to create your bookings table:
     ```sql
     CREATE TABLE bookings (
         id SERIAL PRIMARY KEY,
         name TEXT NOT NULL,
         email TEXT NOT NULL,
         plan TEXT NOT NULL,
         location TEXT NOT NULL,
         date TEXT NOT NULL,
         time TEXT NOT NULL,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

---

## Step 2: Deploy the Backend (Render)

Render is an excellent platform for hosting Node.js APIs.

1. **Push your code to GitHub:** 
   - Create a free GitHub account if you don't have one.
   - Upload the `paavan` folder (both frontend and backend) to a new GitHub repository.
2. **Create a Render account:** Go to [render.com](https://render.com/) and sign up with GitHub.
3. **Create a New Web Service:**
   - Click "New +" and select **Web Service**.
   - Connect your GitHub account and select your repository.
4. **Configure the Web Service:**
   - **Name:** `paavan-backend` (or similar)
   - **Root Directory:** Type `backend` (this tells Render to only look at the backend folder).
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Set Environment Variables:**
   - Scroll down to the **Environment Variables** section.
   - Add a new variable:
     - **Key:** `DATABASE_URL`
     - **Value:** *[Paste the Supabase Connection String you copied in Step 1]*
6. **Deploy:** Click **Create Web Service**. Render will now build and deploy your API. 
7. **Get your Backend URL:** Once live, copy the Render URL at the top left (e.g., `https://paavan-backend.onrender.com`).

---

## Step 3: Deploy the Frontend (Vercel)

Vercel is the creator of Next.js and provides lightning-fast hosting for Vite/React applications.

1. **Update API URL:** 
   - Before deploying, you need to tell your frontend where the live backend is. 
   - Open `frontend/src/pages/Booking.jsx`.
   - Find the line: `const response = await fetch('http://localhost:5000/api/bookings', ...`
   - Change `http://localhost:5000` to your new Render URL (e.g., `https://paavan-backend.onrender.com/api/bookings`).
   - Push this code update to GitHub.
2. **Create a Vercel account:** Go to [vercel.com](https://vercel.com/) and sign up with GitHub.
3. **Import Project:**
   - Click **Add New...** -> **Project**.
   - Import your GitHub repository.
4. **Configure the Project:**
   - **Root Directory:** Click Edit and select the `frontend` folder.
   - Vercel will automatically detect that you are using Vite and React. The Build Command (`npm run build`) and Output Directory (`dist`) will be filled out for you automatically.
5. **Deploy:** Click **Deploy**. Vercel will build the frontend and put it live on a global CDN.
6. **Get your Live URL:** Once finished, Vercel will give you a live `.vercel.app` domain (e.g., `https://paavan.vercel.app`). You can also add a custom domain if you own one.

---

### Congratulations! 🎉
Your Paavan Go Electric website is now fully live on the internet! 

Users can visit your Vercel URL, submit a booking, the frontend will securely pass that to your Render backend, and the data will be permanently saved in your Supabase database!
