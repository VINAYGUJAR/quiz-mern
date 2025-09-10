const mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
question: { type: String, required: true },
options: [{ type: String, required: true }],
correctAnswer: { type: Number, required: true } // index (0-based) to avoid exposing text
});


const quizSchema = new mongoose.Schema({
title: { type: String, required: true },
questions: [questionSchema],
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });


module.exports = mongoose.model('Quiz', quizSchema);