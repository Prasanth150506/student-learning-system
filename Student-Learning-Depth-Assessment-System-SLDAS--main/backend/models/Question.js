const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  type: { type: String, enum: ['MCQ', 'Descriptive'], required: true },
  question: { type: String, required: true },
  options: [{ type: String }], // only for MCQ
  correctAnswer: { type: String }, // for MCQ
  modelAnswer: { type: String }, // for Descriptive
  marks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
