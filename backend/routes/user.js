const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/auth");

router.get(
	"/dashboard",
	verifyToken,
	authorizeRoles("admin", "teacher"), // example: only admins and teachers
	(req, res) => {
		res.json({ msg: `Welcome ${req.user.role}` });
	}
);

module.exports = router;
