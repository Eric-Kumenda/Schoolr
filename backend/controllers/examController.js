const {
	Exam,
	ExamResult,
	Student,
	School,
} = require("../models/newSchoolModel"); // Adjust path to your models

// Helper to calculate grade (example logic, customize as needed)
const calculateGrade = (marks) => {
	if (marks >= 80) return "A";
	if (marks >= 70) return "B";
	if (marks >= 60) return "C";
	if (marks >= 50) return "D";
	return "E";
};

// 1. Create New Exam (Admin only)
exports.createExam = async (req, res) => {
	try {
		const { examName, academicYear, term, examDate } = req.body;
		const schoolId = req.user.schoolId; // From authenticated admin's session
		const createdBy = req.user.id; // From authenticated admin's session

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}
		const school = await School.findOne({ schoolId: schoolId });
		if (!school) {
			return res.status(400).json({ message: "School not found." });
		}
		const schoolObjectId = school._id;

		if (!examName || !academicYear || !term) {
			return res.status(400).json({
				message: "Exam name, academic year, and term are required.",
			});
		}

		// Check for duplicate exam for the school in the same term/year
		const existingExam = await Exam.findOne({
			schoolObjectId,
			examName,
			academicYear,
			term,
		});
		if (existingExam) {
			return res.status(409).json({
				message:
					"An exam with this name, academic year, and term already exists for this school.",
			});
		}

		const newExam = new Exam({
			schoolId: schoolObjectId,
			examName,
			academicYear,
			term,
			examDate: examDate || Date.now(), // Use provided date or default
			status: "provisional", // Always provisional initially
			createdBy,
		});

		await newExam.save();

		res.status(201).json({
			message: "Exam created successfully as provisional.",
			exam: newExam,
		});
	} catch (error) {
		console.error("Error creating exam:", error);
		res.status(500).json({
			message: "Failed to create exam.",
			error: error.message,
		});
	}
};

// 2. Get Exams for a School (Admin, Teacher)
exports.getExams = async (req, res) => {
	try {
		const schoolId = req.user.schoolId; // From authenticated user's session

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}

		const exams = await Exam.find({ schoolId }).sort({
			academicYear: -1,
			term: 1,
			examDate: -1,
		});

		res.status(200).json({ exams: exams });
	} catch (error) {
		console.error("Error fetching exams:", error);
		res.status(500).json({
			message: "Failed to fetch exams.",
			error: error.message,
		});
	}
};

// 3. Get Students for Result Entry (Admin, Teacher)
// This will fetch students with their basic info for a specific exam context
exports.getStudentsForResultsEntry = async (req, res) => {
	try {
		const { examId } = req.params;
		const { cohort, stream } = req.query; // Optional filters
		const schoolId = req.user.schoolId;

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}
		if (!examId) {
			return res.status(400).json({
				message:
					"Exam ID is required to fetch students for results entry.",
			});
		}

		// Validate exam exists and belongs to school
		const exam = await Exam.findOne({ _id: examId, schoolId });
		if (!exam) {
			return res.status(404).json({
				message: "Exam not found or does not belong to this school.",
			});
		}

		let studentQuery = { schoolId };
		if (cohort) {
			studentQuery.cohort = cohort;
		}
		if (stream) {
			studentQuery.stream = stream;
		}

		// Select only necessary student fields
		const students = await Student.find(studentQuery)
			.select(
				"adm_no first_name middle_name surname stream cohort current_study_year subjects"
			)
			.sort({ cohort: 1, stream: 1, adm_no: 1 });

		// For each student, find their existing results for this exam and subject (if provided)
		// This makes it easy to pre-populate form fields or show current results
		const studentResults = await Promise.all(
			students.map(async (student) => {
				const results = await ExamResult.find({
					studentId: student._id,
					examId: exam._id,
				}).select("subject marks grade comment"); // Get all subjects for this student for this exam

				return {
					_id: student._id,
					adm_no: student.adm_no,
					first_name: student.first_name,
					middle_name: student.middle_name,
					surname: student.surname,
					stream: student.stream,
					cohort: student.cohort,
					current_study_year: student.current_study_year,
					subjects: student.subjects,
					results: results || [], // Attach existing results
				};
			})
		);

		res.status(200).json({ students: studentResults });
	} catch (error) {
		console.error("Error fetching students for results entry:", error);
		res.status(500).json({
			message: "Failed to fetch students for results entry.",
			error: error.message,
		});
	}
};

// 4. Update Student Result for a Subject (Admin, Teacher)
exports.updateStudentResult = async (req, res) => {
	try {
		const { examId, studentId } = req.params;
		const { subject, marks, comment } = req.body; // Expecting marks for a specific subject
		const schoolId = req.user.schoolId;
		const lastUpdatedBy = req.user.id;

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}
		if (
			!examId ||
			!studentId ||
			!subject ||
			marks === undefined ||
			marks === null
		) {
			return res.status(400).json({
				message:
					"Exam ID, Student ID, Subject, and Marks are required.",
			});
		}
		if (marks < 0 || marks > 100) {
			return res
				.status(400)
				.json({ message: "Marks must be between 0 and 100." });
		}

		// Validate exam exists and is provisional (only provisional exams can be edited by teachers/admins)
		const exam = await Exam.findOne({ _id: examId, schoolId });
		if (!exam) {
			return res.status(404).json({
				message: "Exam not found or does not belong to this school.",
			});
		}
		if (
			exam.status === "official" &&
			req.user.role !== "school_admin" &&
			req.user.role !== "super_admin"
		) {
			// Only allow super_admin/school_admin to change official marks IF absolutely necessary.
			// Best practice: official results are immutable. Consider a "revert to provisional" flow if needed.
			return res.status(403).json({
				message:
					"Official exam results cannot be updated by this role.",
			});
		}

		// Validate student exists and belongs to school
		const student = await Student.findOne({ _id: studentId, schoolId });
		if (!student) {
			return res.status(404).json({
				message: "Student not found or does not belong to this school.",
			});
		}

		const grade = calculateGrade(marks); // Calculate grade

		// Find and update existing result or create new one
		const updatedResult = await ExamResult.findOneAndUpdate(
			{ examId, studentId, subject, schoolId }, // Query
			{
				marks,
				grade,
				comment,
				lastUpdatedBy,
				lastUpdatedAt: Date.now(),
				adm_no: student.adm_no, // Ensure adm_no is set/updated
			},
			{ new: true, upsert: true, runValidators: true } // upsert: true creates if not found
		);

		res.status(200).json({
			message: "Student result updated successfully.",
			result: updatedResult,
		});
	} catch (error) {
		console.error("Error updating student result:", error);
		if (error.name === "ValidationError") {
			return res
				.status(400)
				.json({ message: error.message, errors: error.errors });
		}
		res.status(500).json({
			message: "Failed to update student result.",
			error: error.message,
		});
	}
};

// 5. Set Exam Status to Official (Admin only)
exports.setExamOfficial = async (req, res) => {
	try {
		const { examId } = req.params;
		const schoolId = req.user.schoolId;
		const publishedBy = req.user.id; // Admin who publishes

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}

		const exam = await Exam.findOneAndUpdate(
			{ _id: examId, schoolId, status: "provisional" }, // Find provisional exam in this school
			{
				$set: {
					status: "official",
					publishedBy: publishedBy,
					publishedAt: Date.now(),
				},
			},
			{ new: true }
		);

		if (!exam) {
			return res.status(404).json({
				message:
					"Provisional exam not found or already official for this school.",
			});
		}

		res.status(200).json({ message: "Exam status set to official.", exam });
	} catch (error) {
		console.error("Error setting exam official:", error);
		res.status(500).json({
			message: "Failed to set exam official.",
			error: error.message,
		});
	}
};

// 6. Get Exam Results for Student/Parent/Teacher/Admin
exports.getStudentExamResults = async (req, res) => {
	try {
		const { studentId } = req.params; // For parent/student views
		const { examId } = req.query; // Optional filter to get results for a specific exam
		const schoolId = req.user.schoolId;
		const userRole = req.user.role;
		const userId = req.user.id;

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}

		let student;
		// Authorization check
		if (userRole === "parent") {
			const parent = await Parent.findOne({
				userId: userId,
				studentIds: studentId,
			});
			if (!parent) {
				return res.status(403).json({
					message: "Not authorized to view this student's results.",
				});
			}
			student = await Student.findOne({ _id: studentId, schoolId });
		} else if (userRole === "student") {
			// Assuming student user ID is linked to student document
			student = await Student.findOne({ _id: userId, schoolId }); // If student user directly represents a student
			if (!student || student._id.toString() !== studentId) {
				return res
					.status(403)
					.json({ message: "Not authorized to view these results." });
			}
		} else if (
			userRole === "teacher" ||
			userRole === "school_admin" ||
			userRole === "super_admin"
		) {
			student = await Student.findOne({ _id: studentId, schoolId });
			if (!student) {
				return res
					.status(404)
					.json({ message: "Student not found in this school." });
			}
		} else {
			return res
				.status(403)
				.json({ message: "Unauthorized role to view results." });
		}

		let query = { studentId: student._id, schoolId };
		if (examId) {
			query.examId = examId;
		}

		// Populate exam details for status check
		const examResults = await ExamResult.find(query)
			.populate({
				path: "examId",
				select: "examName academicYear term status", // Select status to filter
			})
			.sort({
				"examId.academicYear": -1,
				"examId.term": 1,
				"examId.examDate": -1,
				subject: 1,
			});

		// Filter results based on exam status and user role
		const filteredResults = examResults.filter((result) => {
			if (!result.examId) return false; // Should not happen with proper population
			if (result.examId.status === "official") {
				return true; // Everyone can see official results
			}
			// For provisional results, only admins and teachers can see
			return (
				userRole === "school_admin" ||
				userRole === "super_admin" ||
				userRole === "teacher"
			);
		});

		res.status(200).json({ studentResults: filteredResults });
	} catch (error) {
		console.error("Error fetching student exam results:", error);
		res.status(500).json({
			message: "Failed to fetch student exam results.",
			error: error.message,
		});
	}
};

// 7. Get All Results for a Specific Exam (Admin, Teacher, possibly for reporting)
exports.getExamResultsByExamId = async (req, res) => {
	try {
		const { examId } = req.params;
		const schoolId = req.user.schoolId;
		const userRole = req.user.role;

		if (!schoolId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}

		const exam = await Exam.findOne({ _id: examId, schoolId });
		if (!exam) {
			return res.status(404).json({
				message: "Exam not found or does not belong to this school.",
			});
		}

		// Permission check for provisional results
		if (
			exam.status === "provisional" &&
			userRole !== "admin" &&
			userRole !== "teacher"
		) {
			return res.status(403).json({
				message: "Not authorized to view provisional exam results.",
			});
		}

		const results = await ExamResult.find({ examId, schoolId })
			.populate("studentId", "adm_no first_name surname cohort stream") // Populate student details
			.populate("lastUpdatedBy", "email") // Optionally populate who updated it
			.sort({
				"studentId.cohort": 1,
				"studentId.stream": 1,
				"studentId.adm_no": 1,
				subject: 1,
			});

		res.status(200).json({ exam, results });
	} catch (error) {
		console.error("Error fetching exam results by exam ID:", error);
		res.status(500).json({
			message: "Failed to fetch exam results.",
			error: error.message,
		});
	}
};
