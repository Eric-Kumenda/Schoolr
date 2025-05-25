const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController'); // Adjust path
const requireAdmin = require('../middleware/requireAdmin'); // Requires 'school_admin' or 'super_admin'
const requireTeacher = require('../middleware/requireTeacher'); // Requires 'teacher' role
const requireAuth = require('../middleware/requireAuth');


// Admin only routes
router.post('/create', requireAdmin, examController.createExam); // Create new exam
router.put('/:examId/official', requireAdmin, examController.setExamOfficial); // Set exam to official

// Admin and Teacher routes (for results entry)
router.get('/list', requireTeacher, examController.getExams); // List all exams (for admin/teacher to select)
router.get('/:examId/students-for-entry', requireTeacher, examController.getStudentsForResultsEntry); // Get students for specific exam entry
router.put('/:examId/students/:studentId/results', requireTeacher, examController.updateStudentResult); // Update single student's subject result

// General authenticated user routes (with specific authorization)
router.get('/students/:studentId/exam-results', requireAuth, examController.getStudentExamResults); // Get a specific student's results

// Admin/Teacher/SuperAdmin: Get all results for a particular exam
router.get('/:examId/all-results', requireTeacher, examController.getExamResultsByExamId); // Teachers and Admins can see

module.exports = router