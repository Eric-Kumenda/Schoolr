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
} = require("../controllers/schoolController");

router.post("/create", createSchool);
router.post("/getInfo", schoolInfo);
router.post("/upload-students", uploadStudents);

module.exports = router;
