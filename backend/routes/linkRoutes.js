const express = require("express");
const router = express.Router();

const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
	register,
} = require("../controllers/linkController");

router.post("/register", register);


module.exports = router;
