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

// Connect to DB
connectDB(process.env.MONGO_URI);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/quiz', quizRoutes);

app.get('/', (req, res) => res.send('Quiz MERN Backend is running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
