const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Question = require('../models/Question');
const { protect, faculty } = require('../middleware/authMiddleware');

// Get all available tests (Dashboard)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      // Students only see tests where they are specifically assigned
      query = { assignedStudents: req.user.id };
    }
    const tests = await Test.find(query).populate('createdBy', 'name');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty creates test
router.post('/', protect, faculty, async (req, res) => {
  try {
    const { title, duration, totalMarks, questions, assignedStudents } = req.body;
    
    // Create test
    const test = await Test.create({
      title,
      duration,
      totalMarks,
      createdBy: req.user.id,
      assignedStudents: assignedStudents || []
    });

    // Add questions
    if (questions && questions.length > 0) {
      const qs = questions.map(q => ({
        ...q,
        testId: test._id
      }));
      await Question.insertMany(qs);
    }
    
    res.status(201).json({ message: 'Test created successfully', testId: test._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get test details and questions
router.get('/:id', protect, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Check if student is assigned
    if (req.user.role === 'student' && !test.assignedStudents.some(id => id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'You are not assigned to this test' });
    }
    
    const questions = await Question.find({ testId: req.params.id }).select('-correctAnswer -modelAnswer'); // Avoid sending correct answers
    res.json({ test, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get full test including answers (faculty only)
router.get('/:id/full', protect, faculty, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    const questions = await Question.find({ testId: req.params.id });
    res.json({ test, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty updates test
router.put('/:id', protect, faculty, async (req, res) => {
  try {
    const { title, duration, totalMarks, questions, assignedStudents } = req.body;
    
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Update test
    test.title = title || test.title;
    test.duration = duration || test.duration;
    test.totalMarks = totalMarks || test.totalMarks;
    test.assignedStudents = assignedStudents || test.assignedStudents;
    await test.save();

    // Replace questions
    await Question.deleteMany({ testId: req.params.id });
    if (questions && questions.length > 0) {
      const qs = questions.map(q => ({
        ...q,
        _id: undefined, // ensure new IDs
        testId: test._id
      }));
      await Question.insertMany(qs);
    }
    
    res.json({ message: 'Test updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty deletes test
router.delete('/:id', protect, faculty, async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ testId: req.params.id });
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
