const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');


const createTokenAndSetCookie = (res, user) => {
const payload = { id: user._id, role: user.role };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });


const cookieOptions = {
httpOnly: true,
secure: process.env.COOKIE_SECURE === 'true',
maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
};
res.cookie('token', token, cookieOptions);
};
//he

exports.register = async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { username, email, password } = req.body;
try {
const existing = await User.findOne({ email });
if (existing) return res.status(400).json({ message: 'Email already registered' });


const hashed = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, password: hashed, role: 'student' });


createTokenAndSetCookie(res, user);
res.status(201).json({ message: 'Registered successfully', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
} catch (err) {
res.status(500).json({ message: 'Server error', error: err.message });
}
};


exports.login = async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { email, password } = req.body;
try {
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });


const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


createTokenAndSetCookie(res, user);
res.json({ message: 'Logged in', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
} catch (err) {
res.status(500).json({ message: 'Server error', error: err.message });
}
};


exports.logout = async (req, res) => {
res.clearCookie('token');
res.json({ message: 'Logged out' });
};