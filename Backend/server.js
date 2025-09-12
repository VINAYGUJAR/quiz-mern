require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authroute');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------
// Connect to MongoDB
// ---------------------
connectDB(process.env.MONGO_URI);

// ---------------------
// Middlewares
// ---------------------
app.use(express.json());
app.use(cookieParser());

// CORS setup for deployed frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // frontend domain
  credentials: true, // allows cookies to be sent cross-origin
}));

// ---------------------
// Routes
// ---------------------
app.use('/auth', authRoutes);
app.use('/quiz', quizRoutes);

app.get('/', (req, res) => res.send('Quiz MERN Backend is running'));

// ---------------------
// Global Error Handler
// ---------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ---------------------
// Start Server
// ---------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
