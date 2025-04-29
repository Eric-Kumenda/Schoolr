const express = require("express");
const router = express.Router();

const passport = require("passport");
const jwt = require("jsonwebtoken");

const multer = require("multer");
//const upload = multer({ storage: multer.memoryStorage() });

const { createSchool, schoolInfo } = require("../controllers/schoolController");

router.post("/create", createSchool);
router.post("/getInfo", schoolInfo);

module.exports = router;
