const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.cookies && req.cookies.token;
		if (!token) return res.status(401).json({ message: 'Not authenticated' });
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(payload.id).select('-password');
		if (!user) return res.status(401).json({ message: 'User not found' });
		req.user = user; // attach user to request
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid/Expired token' });
	}
};

const adminMiddleware = (req, res, next) => {
	if (req.user && req.user.role === 'admin') return next();
	return res.status(403).json({ message: 'Admin access required' });
};

const studentMiddleware = (req, res, next) => {
	if (req.user && req.user.role === 'student') return next();
	return res.status(403).json({ message: 'Student access required' });
};

module.exports = { authMiddleware, adminMiddleware, studentMiddleware };