# Event Management & Ticket Booking System

A full-stack MERN application for discovering events, booking tickets, generating QR-based passes, and validating attendees at the gate. EventFlow is designed for two primary users: attendees who want a smooth booking experience, and organizers who need practical tools to create events, track sales, scan tickets, and manage event lifecycles.

The system includes authentication, role-based access, ticket booking, QR code generation, QR scanning, organizer analytics, responsive layouts, dark/light mode, manual event deletion, and scheduled auto-delete support.

## Features

### Attendees

- **Browse Events**
  - Visit the home page to view all available events.
  - Event cards show title, date, location, price, image, and ticket availability.
  - Layout is responsive for Android, iOS, tablets, and desktop screens.

- **View Event Details**
  - Open any event to see full description, organizer, location, date, capacity, and ticket price.
  - Sold-out events are clearly disabled for booking.

- **Register and Login**
  - Create an account as an `Attendee`.
  - Login sessions are protected with JWT authentication.

- **Online Ticket Booking**
  - Book tickets for available events.
  - The backend checks capacity before creating a ticket.
  - Ticket availability decreases automatically after booking.

- **Dynamic Ticket Generation**
  - Each booking creates a unique ticket with a secure `qrCodeHash`.
  - Tickets are available on the `My Tickets` page.

- **QR Ticket Display**
  - Each ticket displays a QR code generated from the unique ticket hash.
  - Attendees can show the QR code at the event gate.

- **Dark/Light Mode**
  - Toggle between light and dark themes from the navigation bar.
  - Theme preference is saved in local storage.

### Organizers

- **Organizer Registration**
  - Create an account as an `Organizer`.
  - Organizer-only routes are protected by role-based authorization.

- **Event Creation**
  - Create events with:
    - Title
    - Description
    - Date and time
    - Location
    - Capacity
    - Ticket price
    - Image URL
    - Optional auto-delete timer

- **Organizer Dashboard**
  - View all events created by the logged-in organizer.
  - See total events, tickets sold, revenue, ticket availability, and per-event performance.

- **Edit Events**
  - Update event details after creation.
  - Change capacity safely without reducing below already-sold ticket count.
  - Add, update, or remove the auto-delete timer.

- **Manual Event Deletion**
  - Delete events from the Event Details page.
  - A confirmation modal prevents accidental deletion.
  - Deleting an event also removes associated tickets.

- **Auto-Delete Event Timer**
  - Set an optional `autoDeleteAt` date/time.
  - The backend checks for expired events on a schedule and removes them with their tickets.

- **QR Ticket Validation**
  - Use the Organizer Scanner page to scan attendee QR codes.
  - A manual QR hash input is available as a fallback.
  - Tickets can only be scanned once.
  - Already-scanned tickets return an error.

- **Analytics Dashboard**
  - Track:
    - Total tickets sold
    - Total revenue
    - Event-level sales
    - Remaining capacity

### Admins

- Admin users can access protected management flows intended for elevated access.
- Admins can delete or manage events where backend authorization allows it.

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- Lucide React
- qrcode.react
- html5-qrcode

### Backend

- Node.js
- Express.js
- Mongoose
- JWT authentication
- bcrypt.js password hashing
- Native Node scheduled timer for auto-delete jobs

### Database

- MongoDB
- MongoDB Atlas or local MongoDB instance

## Project Structure

```text
EventManagement-Project/
  backend/
    config/
    controllers/
    jobs/
    middleware/
    models/
    routes/
    seed.js
    server.js
  frontend/
    public/
    src/
      api/
      components/
      context/
      hooks/
      pages/
      utils/
    vite.config.js
  run-app.bat
  start-dev.bat
  README.md
```

## Environment Variables

Create a `.env` file inside the `backend` folder.

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflow
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

### Optional Payment Variables

The current project stores `paymentStatus` but does not yet include a live payment gateway integration. If you add Stripe or Razorpay later, use variables like:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Do not commit real secrets to GitHub.

## Local Development

Install backend dependencies:

```powershell
cd backend
npm.cmd install
```

Install frontend dependencies:

```powershell
cd frontend
npm.cmd install
```

Run backend:

```powershell
cd backend
npm.cmd run dev
```

Run frontend:

```powershell
cd frontend
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Seed Test Events

The backend includes a seed script that creates 5 realistic future events and a seed organizer.

Warning: this clears existing events and tickets.

```powershell
cd backend
npm.cmd run seed
```

Seed organizer login:

```text
Email: seed.organizer@eventflow.test
Password: seed12345
```

## Production Build and Start

This project is configured so the Express backend can serve the built React frontend.

### 1. Build the Frontend

```powershell
cd frontend
npm.cmd run build
```

This creates:

```text
frontend/dist
```

### 2. Start the Backend

```powershell
cd backend
npm.cmd start
```

Open:

```text
http://127.0.0.1:5000
```

### One-Command Local Production Launcher

From the root folder:

```powershell
.\run-app.bat
```

This builds the frontend and starts the backend server.

## Deployment Preparation

### Backend Deployment Checklist

1. Add production environment variables on your hosting platform:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT`
   - `CLIENT_URL`
   - Payment keys if implemented later

2. Make sure MongoDB Atlas allows your deployment server IP address.

3. Build the frontend before starting the backend:

   ```powershell
   cd frontend
   npm.cmd run build
   ```

4. Start the backend:

   ```powershell
   cd backend
   npm.cmd start
   ```

### Recommended Production Commands

Install dependencies:

```powershell
cd backend
npm.cmd install
cd ..\frontend
npm.cmd install
```

Build frontend:

```powershell
cd frontend
npm.cmd run build
```

Start backend:

```powershell
cd backend
npm.cmd start
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Events

- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/events/mine`
- `GET /api/events/mine/analytics`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Tickets

- `POST /api/tickets/book/:eventId`
- `GET /api/tickets/mine`
- `POST /api/tickets/scan`

## Default Roles

```text
Attendee
Organizer
Admin
```

## Notes for Future Improvements

- Add real payment gateway integration with Stripe or Razorpay.
- Add email ticket delivery.
- Add image upload support instead of external image URLs.
- Add admin user management.
- Add pagination and search filters for events.
- Add deployment scripts for platforms like Render, Railway, Vercel, or AWS.

## License

This project is intended for educational and internship portfolio use.
