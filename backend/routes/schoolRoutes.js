const express = require("express");
const router = express.Router();

const requireAdmin = require('../middleware/requireAdmin'); // Admin only
const {
	createSchool,
	schoolInfo,
	uploadStudents,
	uploadTeachers,
	getSchoolStudents,
	getSchoolTeachers,
	updateStudent,
	updateTeacher,
	querySchool,
	linkUserToSchool
} = require("../controllers/schoolController");

router.post("/create", createSchool);
router.post("/getInfo", schoolInfo);
router.post("/upload-students", uploadStudents);
router.post("/upload-teachers", uploadTeachers);
router.get("/students/fetch/:schoolId", getSchoolStudents);
router.get("/teachers/fetch/:schoolId", getSchoolTeachers);
router.put("/students/update/:studentId", updateStudent);
router.put("/teachers/update/:teacherId", updateTeacher);
router.get("/fetch/:schoolId", querySchool);

router.post('/admin/link-user-to-school', requireAdmin, linkUserToSchool);

module.exports = router;
