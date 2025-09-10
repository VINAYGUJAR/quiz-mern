

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizcontroller');
const { quizCreateValidator } = require('../validators/quizvalidator');
const { authMiddleware, adminMiddleware, studentMiddleware } = require('../middleware/authmiddleware');

// Admin: Delete quiz
router.delete('/delete/:id', authMiddleware, adminMiddleware, quizController.deleteQuiz);

// Admin: Get all quizzes
router.get('/all-admin', authMiddleware, adminMiddleware, quizController.getAllQuizzes);

// Admin: Create quiz
router.post('/create', authMiddleware, adminMiddleware, quizCreateValidator, quizController.createQuiz);

// Student: Get all quizzes
router.get('/all', authMiddleware, studentMiddleware, quizController.getAllQuizzes);

// Admin: Update quiz
router.put('/update/:id', authMiddleware, adminMiddleware, quizController.updateQuiz);

// Student: Submit quiz answers
router.post('/submit', authMiddleware, studentMiddleware, quizController.submitQuiz);

// Admin: Get all results
router.get('/results', authMiddleware, adminMiddleware, quizController.getAllResults);

module.exports = router;
