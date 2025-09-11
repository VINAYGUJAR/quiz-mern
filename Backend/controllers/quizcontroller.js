// Admin: Update quiz
exports.updateQuiz = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, questions } = req.body;
		const updated = await Quiz.findByIdAndUpdate(
			id,
			{ title, questions },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ message: 'Quiz not found' });
		res.json({ message: 'Quiz updated', quiz: updated });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
// Admin: Delete quiz (and all related results)
exports.deleteQuiz = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Quiz.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ message: 'Quiz not found' });
		// Delete all results related to this quiz
		await Result.deleteMany({ quizId: id });
		res.json({ message: 'Quiz and related results deleted' });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');


exports.createQuiz = async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


try {
const { title, questions } = req.body;
const quiz = await Quiz.create({ title, questions, createdBy: req.user._id });
res.status(201).json({ message: 'Quiz created', quiz });
} catch (err) {
res.status(500).json({ message: 'Server error', error: err.message });
}
};


exports.getAllQuizzes = async (req, res) => {
try {
// For students, do not send correctAnswer field. Send question text and options only.
const quizzes = await Quiz.find().select('-questions.correctAnswer').lean();
res.json({ quizzes });
} catch (err) {
res.status(500).json({ message: 'Server error', error: err.message });
}
};


exports.submitQuiz = async (req, res) => {
try {
	const { quizId, answers } = req.body; // answers: [{ questionIndex, selectedOption }]
	const quiz = await Quiz.findById(quizId);
	if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

	// Check if student already submitted
	const already = await Result.findOne({ userId: req.user._id, quizId });
	if (already) return res.status(400).json({ message: 'You have already submitted this quiz' });

	// Check for duplicate answers
	const questionIndices = answers.map(a => a.questionIndex);
	const hasDuplicates = new Set(questionIndices).size !== questionIndices.length;
	if (hasDuplicates) {
		return res.status(400).json({ message: 'Each question can only be answered once.' });
	}

	// Calculate score
	let score = 0;
	answers.forEach((ans) => {
		const q = quiz.questions[ans.questionIndex];
		if (q && Number(q.correctAnswer) === Number(ans.selectedOption)) score += 1;
	});

	const result = await Result.create({ userId: req.user._id, quizId, answers, score });

	// Important: Students should NOT receive score in response (as per requirement)
	res.status(201).json({ message: 'Quiz submitted successfully' });
} catch (err) {
	res.status(500).json({ message: 'Server error', error: err.message });
}
};


exports.getAllResults = async (req, res) => {
try {
// Admin can see all results with student info
const results = await Result.find().populate('userId', 'username email').populate('quizId', 'title').lean();
res.json({ results });
} catch (err) {
res.status(500).json({ message: 'Server error', error: err.message });
}
};