# Deployment Checklist

Use this checklist before deploying the Event Management & Ticket Booking System with:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 1. Render Backend

Create a new Render Web Service from the `backend` folder.

### Render Build Command

```bash
npm install
```

### Render Start Command

```bash
npm start
```

### Render Environment Variables

Paste these into the Render dashboard:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
```

### Optional Future Payment Variables

Only add these if you later integrate payments:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Render Notes

- Replace `CLIENT_URL` after Vercel gives you the final frontend URL.
- Make sure MongoDB Atlas allows Render network access.
- For MongoDB Atlas, allow access from Render or temporarily use `0.0.0.0/0` during testing.
- Keep `JWT_SECRET` private and long.

## 2. Vercel Frontend

Create a new Vercel project from the `frontend` folder.

### Vercel Framework Preset

```text
Vite
```

### Vercel Build Command

```bash
npm run build
```

### Vercel Output Directory

```text
dist
```

### Vercel Environment Variables

Paste this into the Vercel dashboard:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

### Vercel Notes

- Replace the placeholder Render URL with the real backend URL.
- Vite only exposes frontend variables that start with `VITE_`.
- After updating environment variables, redeploy the Vercel project.

## 3. Required URL Wiring

After both deployments are created:

1. Copy your Vercel frontend URL.
2. Paste it into Render as:

   ```env
   CLIENT_URL=https://your-vercel-frontend-url.vercel.app
   ```

3. Copy your Render backend URL.
4. Paste it into Vercel as:

   ```env
   VITE_API_URL=https://your-render-backend-url.onrender.com/api
   ```

5. Redeploy both services.

## 4. Quick Production Test

Open your backend health URL:

```text
https://your-render-backend-url.onrender.com/api/status
```

Expected response:

```json
{
  "backend": "running",
  "db": "connected",
  "environment": "production"
}
```

Then open the frontend:

```text
https://your-vercel-frontend-url.vercel.app
```

Test:

- Register an Organizer account.
- Create an event.
- Register an Attendee account.
- Book a ticket.
- Open My Tickets and confirm QR generation.
- Login as Organizer and test QR scanner/manual hash validation.

## 5. Final Safety Checklist

- Do not commit `.env` files with real secrets.
- Use a strong `JWT_SECRET`.
- Confirm MongoDB Atlas network access is configured.
- Confirm Render `CLIENT_URL` exactly matches the Vercel URL.
- Confirm Vercel `VITE_API_URL` ends with `/api`.
- Confirm backend logs show MongoDB connected.
- Seed test events only if you are okay clearing existing events and tickets.
