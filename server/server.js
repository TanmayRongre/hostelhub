const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { connectDB, getDBStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { initKeepAlive } = require('./utils/keepAlive');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bedRoutes = require('./routes/bedRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const messRoutes = require('./routes/messRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

// ─── Load Environment Variables ──────────────────────────────────────────────
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database asynchronously
connectDB();

const app = express();

// ─── Production & Development CORS Configuration ──────────────────────────────
// Collect all potential origins from environment variables
const rawClientUrls = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
]
  .filter(Boolean)
  .flatMap((url) => url.split(',').map((u) => u.trim().replace(/\/$/, '')));

const allowedOriginsSet = new Set(rawClientUrls);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (mobile apps, server-to-server pings, Postman, curl)
    if (!origin) return callback(null, true);

    // 2. Allow if origin matches configured list
    if (allowedOriginsSet.has(origin) || allowedOriginsSet.has('*')) {
      return callback(null, true);
    }

    // 3. Allow standard hosting preview/production domains (Vercel, Render, Netlify, localhost)
    const isHostingSubdomain =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /\.netlify\.app$/.test(origin) ||
      /\.github\.io$/.test(origin);

    if (isHostingSubdomain) {
      return callback(null, true);
    }

    // 4. Default permissive fallback for demo and hackathon deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Middleware to check DB connection on database-dependent routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  const dbStatus = getDBStatus();
  if (!dbStatus.connected) {
    if (dbStatus.readyState === 2) {
      return next();
    }
    connectDB();
  }
  next();
});

// ─── Mount API Routes ────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// ─── Serve Built Frontend in Production (if present) ──────────────────────────
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    // If it's an API route that wasn't matched, delegate to notFound handler
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: '🚀 MountReach 2026 API Server is Running',
      status: 'active',
      health: '/api/health',
    });
  });
}

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// Host & Port configuration

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );

    // Initialize Render / Cloud Keep-Alive self-pinger
    try {
      if (typeof initKeepAlive === 'function') {
        initKeepAlive({
          intervalMs: 10 * 60 * 1000, // Ping every 10 minutes
        });
      }
    } catch (e) {
      console.warn('Keep-alive notice:', e.message);
    }
  });
}

module.exports = app;
