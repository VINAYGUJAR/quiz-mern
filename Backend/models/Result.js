const mongoose = require('mongoose');


const resultSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
answers: [{ questionIndex: Number, selectedOption: Number }],
score: { type: Number, required: true }
}, { timestamps: true });


module.exports = mongoose.model('Result', resultSchema);