const express = require("express");
const router = express.Router();
const Student = require("../models/newSchoolModel");

// POST: Create student
router.post("/", async (req, res) => {
	try {
		const student = new Student(req.body);
		await student.save();
		res.status(201).json(student);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// GET: List all students
router.get("/", async (req, res) => {
	try {
		const students = await Student.find();
		res.json(students);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
