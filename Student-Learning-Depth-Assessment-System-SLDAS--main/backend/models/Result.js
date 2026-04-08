const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    providedAnswer: { type: String },
    marksAwarded: { type: Number },
    feedback: { type: String }
  }],
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  overallFeedback: { type: String },
  scoreLevel: { type: String }, // Beginner, Intermediate, Advanced
  isMalpractice: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
