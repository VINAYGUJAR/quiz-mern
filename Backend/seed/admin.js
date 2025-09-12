
// This script seeds a single admin user. Run manually as needed.
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizdb';

async function seedAdmin() {
  await mongoose.connect(MONGO_URI);
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    console.log('Admin already exists.');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash('admin123', 10); // Change password after first login
  await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('Admin user created.');
  process.exit(0);
}

seedAdmin();
