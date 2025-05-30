const { default: mongoose } = require("mongoose");
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
		const schoolId = req.user.schoolObjectId; // From authenticated user's session

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
		const schoolId = req.user.schoolObjectId;

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
		const schoolId = req.user.schoolObjectId;
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
		const schoolId = req.user.schoolObjectId;
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
		const schoolObjectId = req.user.schoolObjectId;
		const userRole = req.user.role;
		const userId = req.user.id;

		if (!schoolObjectId) {
			return res.status(400).json({
				message: "School ID not found for authenticated user.",
			});
		}

		let student;
		// Authorization check
		/*if (userRole === "parent") {
			const parent = await Parent.findOne({
				userId: userId,
				studentIds: studentId,
			});
			if (!parent) {
				return res.status(403).json({
					message: "Not authorized to view this student's results.",
				});
			}
			student = await Student.findOne({ _id: studentId, schoolObjectId });
		} else*/ if (userRole === "student") {
			// Assuming student user ID is linked to student document
			student = await Student.findOne({
				_id: studentId,
				schoolId: schoolObjectId,
			});
			if (!student || student._id.toString() !== studentId) {
				return res
					.status(403)
					.json({ message: "Not authorized to view these results." });
			}
		} else if (userRole === "teacher" || userRole === "admin") {
			student = await Student.findOne({
				_id: studentId,
				schoolId: schoolObjectId,
			});
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

		let query = { studentId: student._id, schoolId: schoolObjectId };
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
			return userRole === "admin" || userRole === "teacher";
		});

		res.status(200).json({
			studentResults: filteredResults,
			studentDetails: student,
		});
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
		const schoolId = req.user.schoolObjectId;
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

exports.getCohortExamPerformance = async (req, res) => {
	try {
		// Assuming schoolId is available from authentication middleware (e.g., req.user.schoolId)
		const schoolId = req.user.schoolObjectId;

		if (!schoolId) {
			return res
				.status(400)
				.json({
					message: "School ID not found for authenticated user.",
				});
		}

		const data = await ExamResult.aggregate([
			{
				$match: {
					schoolId: new mongoose.Types.ObjectId(schoolId),
					marks: { $ne: null }, // Ensure only results with actual marks are considered
				},
			},
			// Step 1: Calculate average marks per student for each exam (across all subjects)
			// This gives a student's overall performance for a specific exam
			{
				$group: {
					_id: {
						studentId: "$studentId",
						examId: "$examId",
					},
					studentExamTotalMarks: { $sum: "$marks" },
					studentExamSubjectCount: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0, // Exclude _id from this stage
					studentId: "$_id.studentId",
					examId: "$_id.examId",
					studentAverageScore: {
						$divide: [
							"$studentExamTotalMarks",
							"$studentExamSubjectCount",
						],
					},
				},
			},
			// Step 2: Lookup Exam details to get examName and examDate for sorting and labeling
			{
				$lookup: {
					from: "exams", // The actual collection name for the Exam model
					localField: "examId",
					foreignField: "_id",
					as: "examDetails",
				},
			},
			{
				$unwind: "$examDetails", // Deconstructs the array generated by $lookup
			},
			// Step 3: Lookup Student details to get the cohort
			{
				$lookup: {
					from: "students", // The actual collection name for the Student model
					localField: "studentId",
					foreignField: "_id",
					as: "studentDetails",
				},
			},
			{
				$unwind: "$studentDetails", // Deconstructs the array generated by $lookup
			},
			// Step 4: Calculate the average performance per cohort per exam
			{
				$group: {
					_id: {
						examId: "$examId",
						examName: "$examDetails.examName",
						examDate: "$examDetails.examDate",
						cohort: "$studentDetails.cohort",
					},
					cohortAverageScore: { $avg: "$studentAverageScore" }, // Average of student averages for this cohort and exam
				},
			},
			// Step 5: Sort the results by exam date to ensure the x-axis is chronological
			{
				$sort: {
					"_id.examDate": 1, // Sort by examDate ascending
				},
			},
			// Step 6: Project to reshape the output into a cleaner format
			{
				$project: {
					_id: 0, // Exclude the aggregation _id
					examId: "$_id.examId",
					examName: "$_id.examName",
					examDate: "$_id.examDate",
					cohort: "$_id.cohort",
					averageScore: { $round: ["$cohortAverageScore", 2] }, // Round scores to 2 decimal places
				},
			},
		]);

		// Transform the flat array of results into the desired format for Chart.js
		// { examLabels: ["Exam1", "Exam2"], cohortData: { "Cohort A": [score1, score2], "Cohort B": [score1, score2] } }
		const examLabelsSet = new Set(); // Use a Set to get unique exam names and maintain order
		const cohortDataMap = new Map(); // Map to store cohort -> { examName -> score }

		data.forEach((item) => {
			examLabelsSet.add(item.examName);
			if (!cohortDataMap.has(item.cohort)) {
				cohortDataMap.set(item.cohort, new Map());
			}
			cohortDataMap
				.get(item.cohort)
				.set(item.examName, item.averageScore);
		});

		const examLabels = Array.from(examLabelsSet); // Convert Set to Array for x-axis labels
		const transformedCohortData = {};

		cohortDataMap.forEach((examScoresMap, cohortName) => {
			// For each cohort, create an array of scores corresponding to the examLabels order
			const scoresForCohort = examLabels.map((examName) => {
				return examScoresMap.get(examName) || 0; // Use 0 if a cohort doesn't have data for a specific exam
			});
			transformedCohortData[cohortName] = scoresForCohort;
		});

		res.status(200).json({
			examLabels,
			cohortData: transformedCohortData,
		});
	} catch (error) {
		console.error("Error fetching cohort exam performance:", error);
		res.status(500).json({
			message: "Failed to fetch cohort exam performance.",
			error: error.message,
		});
	}
};

// New function to get a list of exams for dropdown selection
exports.getExamsListForDropdown = async (req, res) => {
	try {
		const schoolId = req.user.schoolObjectId; // Assuming schoolId from authentication middleware

		if (!schoolId) {
			return res.status(400).json({ message: "School ID not found." });
		}

		// Fetch exams, selecting only necessary fields and sorting by most recent
		const exams = await Exam.find(
			{ schoolId: new mongoose.Types.ObjectId(schoolId) },
			{ _id: 1, examName: 1, examDate: 1 } // Select _id, examName, examDate
		).sort({ examDate: -1, createdAt: -1 }); // Sort by examDate descending, then creation date

		res.status(200).json(exams);
	} catch (error) {
		console.error("Error fetching exams for dropdown:", error);
		res.status(500).json({
			message: "Failed to fetch exams list.",
			error: error.message,
		});
	}
};

// New function to get a student's results for a specific exam
exports.getStudentExamResultsForExam = async (req, res) => {
	try {
		const { studentId, examId } = req.params;
		const schoolId = req.user.schoolObjectId; // Assuming schoolId from authentication middleware

		if (!schoolId) {
			return res.status(400).json({ message: "School ID not found." });
		}

		// Security: If the requesting user is a student, ensure they can only view their own results
		if (req.user.role !== "student") {
			//&& req.user.studentId.toString() !== studentId.toString()) {
			return res
				.status(403)
				.json({
					message: "Unauthorized to view other student's results.",
				});
		}

		// Fetch exam results for the specified student, exam, and school
		const results = await ExamResult.find(
			{
				studentId: new mongoose.Types.ObjectId(studentId),
				examId: new mongoose.Types.ObjectId(examId),
				schoolId: new mongoose.Types.ObjectId(schoolId),
			},
			{
				subject: 1,
				marks: 1,
				grade: 1,
				comment: 1,
				_id: 0, // Exclude the default _id from individual result documents
			}
		);

		res.status(200).json(results);
	} catch (error) {
		console.error(
			"Error fetching student exam results for specific exam:",
			error
		);
		res.status(500).json({
			message: "Failed to fetch student exam results.",
			error: error.message,
		});
	}
};
