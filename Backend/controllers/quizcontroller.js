const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// ==================== CREATE QUIZ ====================
exports.createQuiz = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

		const { title, questions, timeLimit } = req.body;

		const quiz = await Quiz.create({
			title,
			questions,
			timeLimit: Number(timeLimit) || null, // ensure numeric or null
			createdBy: req.user._id,
		});

		res.status(201).json({ message: 'Quiz created', quiz });
	} catch (err) {
		console.error('Create quiz error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// ==================== UPDATE QUIZ ====================
exports.updateQuiz = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, questions, timeLimit } = req.body;

		const updated = await Quiz.findByIdAndUpdate(
			id,
			{
				title,
				questions,
				timeLimit: Number(timeLimit) || null,
			},
			{ new: true }
		);

		if (!updated) return res.status(404).json({ message: 'Quiz not found' });

		res.json({ message: 'Quiz updated', quiz: updated });
	} catch (err) {
		console.error('Update quiz error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// ==================== DELETE QUIZ ====================
exports.deleteQuiz = async (req, res) => {
	try {
		const { id } = req.params;

		const deleted = await Quiz.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ message: 'Quiz not found' });

		// Delete all related results
		await Result.deleteMany({ quizId: id });

		res.json({ message: 'Quiz and related results deleted' });
	} catch (err) {
		console.error('Delete quiz error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// ==================== GET ALL QUIZZES ====================
exports.getAllQuizzes = async (req, res) => {
	try {
		const quizzes = await Quiz.find()
			.select('-questions.correctAnswer') // hide answers for students
			.lean();

		res.json({ quizzes });
	} catch (err) {
		console.error('Get all quizzes error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// ==================== SUBMIT QUIZ ====================
exports.submitQuiz = async (req, res) => {
	try {
		const { quizId, answers, timeTaken } = req.body;

		if (!quizId || !Array.isArray(answers)) {
			return res.status(400).json({ message: 'quizId and answers are required' });
		}

		const quiz = await Quiz.findById(quizId);
		if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

		// Prevent multiple submissions
		const already = await Result.findOne({ userId: req.user._id, quizId });
		if (already) return res.status(400).json({ message: 'You have already submitted this quiz' });

		// Check duplicate answers
		const questionIndices = answers.map(a => a.questionIndex);
		if (new Set(questionIndices).size !== questionIndices.length) {
			return res.status(400).json({ message: 'Each question can only be answered once' });
		}

		// Calculate score
		let score = 0;
		answers.forEach(a => {
			const q = quiz.questions[a.questionIndex];
			if (q && Number(q.correctAnswer) === Number(a.selectedOption)) score += 1;
		});

		// Save result
		await Result.create({
			userId: req.user._id,
			quizId,
			answers,
			score,
			timeLimit: quiz.timeLimit,
			timeTaken: Number(timeTaken) || null,
		});

		// Students should not receive the score
		res.status(201).json({ message: 'Quiz submitted successfully' });
	} catch (err) {
		console.error('Submit quiz error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// ==================== GET ALL RESULTS (ADMIN) ====================
exports.getAllResults = async (req, res) => {
	try {
		const results = await Result.find()
			.populate('userId', 'username email')
			.populate('quizId', 'title')
			.lean();

		res.json({ results });
	} catch (err) {
		console.error('Get all results error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
