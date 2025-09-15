const { body } = require('express-validator');


exports.quizCreateValidator = [
	body('title').notEmpty().withMessage('Title is required'),
	body('questions').isArray({ min: 1 }).withMessage('At least one question is needed'),
	body('questions.*.question').notEmpty().withMessage('Question text is required'),
	body('questions.*.options').isArray({ min: 2 }).withMessage('Each question must have at least 2 options'),
	body('questions.*.correctAnswer').isInt({ min: 0 }).withMessage('correctAnswer must be an index'),
	// ⏱️ New: validate timeLimit
	body('timeLimit')
		.optional()
		.isInt({ min: 1 })
		.withMessage('timeLimit must be a positive integer (in minutes)')
];