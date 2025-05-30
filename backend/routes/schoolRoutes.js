const express = require("express");
const router = express.Router();

const requireAdmin = require("../middleware/requireAdmin"); // Admin only
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
	linkUserToSchool,
	getSchoolPaymentDetails,
	updateSchoolPaymentDetails
} = require("../controllers/schoolController");
const requireAuth = require("../middleware/requireAuth");

router.post("/create", createSchool);
router.post("/getInfo", schoolInfo);
router.post("/upload-students", uploadStudents);
router.post("/upload-teachers", uploadTeachers);
router.get("/students/fetch/:schoolId", getSchoolStudents);
router.get("/teachers/fetch/:schoolId", getSchoolTeachers);
router.put("/students/update/:studentId", updateStudent);
router.put("/teachers/update/:teacherId", updateTeacher);
router.get("/fetch/:schoolId", querySchool);

router.post("/admin/link-user-to-school", requireAdmin, linkUserToSchool); // Route to get school payment details
router.get("/payment-details", requireAuth, getSchoolPaymentDetails);
// Route to update school payment details (Admin only)
router.put('/payment-details', requireAuth, updateSchoolPaymentDetails);


module.exports = router;
