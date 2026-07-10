const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const { startAutoDeleteJob } = require('./jobs/autoDeleteEvents');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';


const cors = require('cors');

const allowedOrigins = [
  'https://event-management-project-j5q0gjmpc-adam4191416.vercel.app',
  'https://event-management-project-git-main-adam4191416.vercel.app',
  'http://localhost:3000' // Useful for local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  }
}));


// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   'http://localhost:5173',
//   'http://127.0.0.1:5173',
// ].filter(Boolean);

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error('Not allowed by CORS'));
//     },
//     credentials: true,
//   })
// );  

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    backend: 'running',
    db: dbState,
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (!isProduction) {
    console.error(error);
  } else {
    console.error(error.message);
  }

  res.status(statusCode).json({
    message: isProduction && statusCode === 500 ? 'Internal server error' : error.message,
  });
});

const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.static(frontendDistPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  startAutoDeleteJob();
});
