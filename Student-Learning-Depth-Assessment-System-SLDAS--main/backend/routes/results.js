const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Test = require('../models/Test');
const Question = require('../models/Question');
const { protect, faculty } = require('../middleware/authMiddleware');
const { evaluateAnswer } = require('../utils/aiEvaluator');
const { generateLearningRecommendation, generateChatResponse } = require('../utils/aiCoach');

// Submit test answers
router.post('/submit', protect, async (req, res) => {
  try {
    const { testId, answers, isMalpractice } = req.body; // array of { questionId, providedAnswer }
    
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Check if user has already taken this test
    const existingResult = await Result.findOne({ studentId: req.user.id, testId: testId });
    if (existingResult) {
      return res.status(400).json({ message: 'You have already completed this test' });
    }
    
    let totalScore = 0;
    const evaluatedAnswers = [];
    let percentage = 0;
    let scoreLevel = 'Beginner';
    let overallFeedback = '';

    if (isMalpractice) {
      totalScore = 0;
      percentage = 0;
      scoreLevel = 'Malpractice';
      overallFeedback = "Assessment terminated instantly due to multiple policy violations (tab switching, full-screen exit, or copy-paste). Zero marks awarded.";
      
      for (let currentAnswer of answers) {
        evaluatedAnswers.push({
          questionId: currentAnswer.questionId,
          providedAnswer: currentAnswer.providedAnswer,
          marksAwarded: 0,
          feedback: "Disqualified"
        });
      }
    } else {
      for (let currentAnswer of answers) {
        const q = await Question.findById(currentAnswer.questionId);
        if (!q) continue;
        
        let marksAwarded = 0;
        let feedback = "";
        
        if (q.type === 'MCQ') {
          if (q.correctAnswer === currentAnswer.providedAnswer) {
            marksAwarded = q.marks;
            feedback = "Correct";
          } else {
            feedback = "Incorrect";
          }
        } else if (q.type === 'Descriptive') {
          // AI Evaluation integration here
          const evalResult = await evaluateAnswer(currentAnswer.providedAnswer, q.modelAnswer, q.marks);
          marksAwarded = evalResult.marks;
          feedback = evalResult.feedback;
        }
        
        totalScore += marksAwarded;
        evaluatedAnswers.push({
          questionId: q._id,
          providedAnswer: currentAnswer.providedAnswer,
          marksAwarded,
          feedback
        });
      }
      
      percentage = (totalScore / test.totalMarks) * 100;
      
      if (percentage > 85) scoreLevel = 'Advanced';
      else if (percentage > 60) scoreLevel = 'Intermediate';
      
      // Attempt to generate High-Quality AI recommendations using Gemini
      const geminiFeedback = await generateLearningRecommendation(test, evaluatedAnswers, percentage);
      
      if (geminiFeedback) {
        overallFeedback = geminiFeedback;
      } else {
        // Fallback to internal logic if Gemini API fails or key is missing
        let improvementAdvice = "";
        if (percentage < 40) {
          improvementAdvice = "Critical focus needed: You missed several core concepts. We recommend revisiting the foundational chapters and attempting the practice quizzes again.";
        } else if (percentage < 70) {
          improvementAdvice = "Solid start, but gaps remain: You understand the basics, but struggled with detailed descriptive reasoning. Focus on explaining the 'why' behind concepts rather than just the 'what'.";
        } else {
          improvementAdvice = "Minor refinements: You have a great grasp! To reach perfection, double-check your MCQ precision and ensure all key terms from the model answers are included in your descriptions.";
        }
        overallFeedback = `You scored ${totalScore} out of ${test.totalMarks}. ${improvementAdvice}`;
      }
    }
    
    const result = await Result.create({
      studentId: req.user.id,
      testId: testId,
      answers: evaluatedAnswers,
      score: totalScore,
      percentage: percentage,
      overallFeedback,
      scoreLevel,
      isMalpractice: isMalpractice || false
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student to view their own results
router.get('/my-results', protect, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate('testId', 'title')
      .populate('answers.questionId', 'question type correctAnswer modelAnswer');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty to view all results for a particular test
router.get('/test/:testId', protect, faculty, async (req, res) => {
  try {
    const results = await Result.find({ testId: req.params.testId })
      .populate('studentId', 'name email');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single result details by ID
router.get('/details/:id', protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('testId', 'title')
      .populate('studentId', 'name email')
      .populate('answers.questionId', 'question type correctAnswer modelAnswer');
    
    if (!result) return res.status(404).json({ message: 'Result not found' });
    
    // Authorization: Faculty or the student who owns the result
    if (req.user.role !== 'faculty' && result.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Chat for doubt rectification based on a specific result
router.post('/chat', protect, async (req, res) => {
  try {
    const { resultId, message } = req.body;
    
    const result = await Result.findById(resultId)
      .populate('testId', 'title')
      .populate('answers.questionId', 'question type correctAnswer modelAnswer');
    
    if (!result) return res.status(404).json({ message: 'Result not found' });
    
    // Auth check
    if (req.user.role !== 'faculty' && result.studentId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized for this result context' });
    }

    const response = await generateChatResponse(result, message);
    
    res.json({ reply: response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
