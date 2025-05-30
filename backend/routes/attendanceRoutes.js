const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController'); // Adjust path
const requireTeacher = require('../middleware/requireTeacher'); // Teacher or Admin
const requireAdmin = require('../middleware/requireAdmin'); // Admin only
const requireAuth = require('../middleware/requireAuth'); // General authenticated user
//const canViewStudentResults = require('../middleware/canViewStudentResults'); // Reuse or create specific canViewStudentAttendance

// Teacher/Admin Routes for taking/managing attendance
router.get('/students-for-entry', requireTeacher, attendanceController.getStudentsForAttendance); // Get students for daily attendance
router.post('/batch', requireTeacher, attendanceController.recordBatchAttendance); // Record/Update batch attendance
router.get('/daily-overview', requireTeacher, attendanceController.getDailyAttendanceOverview); // View daily attendance records

// Admin only route for dashboard widget
router.get('/monthly-summary', requireAdmin, attendanceController.getMonthlyAttendanceSummary); // Monthly attendance for chart

// General authenticated user route (Student, Parent, Teacher, Admin) for individual student summary
// Using canViewStudentResults middleware as it checks for parent/student/teacher/admin viewing permissions
router.get('/students/:studentId/attendance-summary', requireAuth, attendanceController.getStudentAttendanceSummary);
router.get('/daily-percentage', requireTeacher, attendanceController.getDailyAttendancePercentage);

module.exports = router;