# Setup and Deployment Guide

This guide describes how to run this Flipkart-inspired e-commerce platform locally and deploy it to production.

---

## Technical Architecture

The project is structured as a decoupled full-stack application:
- **Backend**: Express REST API with MongoDB (Mongoose) database models and JWT authentication, listening on port `5000`.
- **Frontend**: React.js client build using Vite, Tailwind CSS, and React Router, running on port `5173`.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:
1. **Node.js** (version 18 or above)
2. **MongoDB** (local community server running, or a MongoDB Atlas cloud connection URI)
3. **Stripe Account** (optional, retrieve publishable and secret keys from [Stripe Dashboard](https://stripe.com) in test mode to enable card payments. Fallback mock simulator is built-in).

---

## 2. Local Development Setup

### Step A: Backend Configuration

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Verify that your environment variables are configured in `.env`. A default template is provided in `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/flipkart
   JWT_SECRET=super_secret_key_for_flipkart_clone_123456
   STRIPE_SECRET_KEY=sk_test_placeholder_key_replace_with_yours
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```
3. Run the database seeding script to pre-populate default catalog categories, products, coupons, and test accounts:
   ```bash
   npm run seed
   ```
4. Start the backend development server using nodemon:
   ```bash
   npm run dev
   ```

### Step B: Frontend Configuration

1. Open another terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 3. Testing Credentials

Use the following seeded accounts to verify the platform features:

### Customer User Account
- **Email**: `user@flipkart.com`
- **Password**: `userpassword`
- **Privilege**: Standard client features (View, Filter, Add to Cart/Wishlist, Address Manager, Checkout, Order Milestones, Reviews).

### Administrator Account
- **Email**: `admin@flipkart.com`
- **Password**: `adminpassword`
- **Privilege**: Access to `/admin` dashboard panel (Sales graphs, metrics, Product CRUD manager, Order updates select, Users directory).

### Stripe Test Card (for Sandbox Checkout)
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g. `12 / 29`)
- **CVC**: Any 3-digit number (e.g. `123`)
- **Zip**: Any code (e.g. `560034`)

---

## 4. Production Deployment Guide

### Deploying the Backend API (Render / Heroku / Railway)

1. Create a new Web Service on your hosting provider linked to your code repository.
2. Set the root directory of the build to `backend` or configure the build commands:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Configure the Environment Variables in the service settings:
   - `MONGODB_URI`: Set to your production MongoDB Atlas cluster URI string.
   - `JWT_SECRET`: Define a secure random string token.
   - `STRIPE_SECRET_KEY`: Enter your live/test Stripe Secret Key.
   - `FRONTEND_URL`: Enter your deployed React app URL (e.g., `https://yourdomain.vercel.app`).
   - `NODE_ENV`: Set to `production`.

### Deploying the Frontend (Vercel / Netlify)

1. Create a new project pointing to your frontend directory.
2. Configure the build parameters:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure Environment Variables:
   - `VITE_API_URL`: Set to the URL of your deployed backend service (e.g., `https://your-api.onrender.com/api`).
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Enter your Stripe Publishable Key.
4. Deploy the service. (Vercel will automatically read `index.html` and distribute static bundles).
