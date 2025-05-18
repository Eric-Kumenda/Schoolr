const express = require("express");
const router = express.Router();

const passport = require("passport");
const jwt = require("jsonwebtoken");

const multer = require("multer");
//const upload = multer({ storage: multer.memoryStorage() });

const {
	createSchool,
	schoolInfo,
	uploadStudents,
	uploadTeachers,
	getSchoolStudents,
	getSchoolTeachers,
	updateStudent,
	updateTeacher,
	querySchool
} = require("../controllers/schoolController");

router.post("/create", createSchool);
router.post("/getInfo", schoolInfo);
router.post("/upload-students", uploadStudents);
router.post("/upload-teachers", uploadTeachers);
router.get("/students/fetch/:schoolId", getSchoolStudents);
router.get("/teachers/fetch/:schoolId", getSchoolTeachers);
router.put("/students/update/:studentId", updateStudent);
router.put("/teachers/update/:schoolId", updateTeacher);
router.get("/fetch/:schoolId", querySchool);

module.exports = router;
