const School = require("../models/School");
const supabase = require("../supabaseClient");

//Query School
exports.querySchool = async (req, res) => {
	const { schoolId } = req.params;
	try {
		const result = await School.aggregate([
			{ $match: { schoolId: schoolId } },
			{ $unwind: "$students" },
			{ $project: { numStudents: { $size: "$students.students" } } },
			{
				// Sum all student counts across cohorts
				$group: {
					_id: null,
					totalStudents: { $sum: "$numStudents" },
				},
			},
		]);

		const totalStudents = result[0]?.totalStudents || 0;
		const school = await School.findOne({ schoolId });

		const totalTeachers = school.teachers?.length || 0;

		res.status(200).json({ totalStudents: totalStudents, totalTeachers: totalTeachers });
	} catch (error) {
		console.error("Error updating student:", error);
		res.status(500).json({
			message: "Failed to update student.",
			error: error.message,
		});
	}
};

// CREATE SCHOOL
exports.createSchool = async (req, res) => {
	const {
		userId,
		name,
		color,
		location,
		motto,
		aim,
		email,
		phone,
		type,
		accreditation,
		establishedYear,
		gender,
	} = req.body;

	try {
		// 1. Insert the school into Supabase
		const { data: newSchoolSupabase, error: insertErrorSupabase } =
			await supabase
				.from("schools")
				.insert([
					{
						name,
						color,
						location,
						motto,
						aim,
						email,
						phone,
						type,
						accreditation,
						establishedYear,
						gender,
						createdBy: userId,
					},
				])
				.select()
				.single();

		if (insertErrorSupabase) throw insertErrorSupabase;

		// 2. Insert a corresponding document into MongoDB with the Supabase school ID
		const newSchoolMongo = new School({
			schoolId: newSchoolSupabase.id,
		});
		await newSchoolMongo.save();

		// 3. Update the user in Supabase to link schoolId + role = admin + isVerified
		await supabase
			.from("users")
			.update({
				schoolId: newSchoolSupabase.id,
				role: "admin",
				isVerified: true,
			})
			.eq("id", userId);

		res.status(201).json({
			message: "School created",
			schoolId: newSchoolSupabase.id,
		});
	} catch (err) {
		console.error("Error creating school:", err);
		res.status(500).json({ error: err.message });
	}
};

// GET SCHOOL INFO
exports.schoolInfo = async (req, res) => {
	const { schoolId } = req.body;

	try {
		const { data: school, error } = await supabase
			.from("schools")
			.select("*")
			.eq("id", schoolId)
			.single();

		if (!school) {
			return res.status(400).json({ msg: "Invalid credentials" });
		}

		res.json({
			schoolId: school.id,
			school: school,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};

// Upload School Students Data
exports.uploadStudents = async (req, res) => {
	try {
		const { schoolId, cohort } = req.body;
		const studentsData = req.body.students;

		if (!schoolId) {
			return res.status(400).json({ message: "School ID is required." });
		}

		if (!Array.isArray(studentsData) || studentsData.length === 0) {
			return res
				.status(200)
				.json({ message: "No student data to upload." });
		}

		const school = await School.findOne({ schoolId: schoolId });
		if (!school) {
			console.log("school not found");
			return res.status(404).json({ message: "School not found." });
		}

		// Basic validation (you might want more robust validation)
		for (const student of studentsData) {
			if (
				!student.adm_no ||
				!student.birth_cert_no ||
				!student.kcpe_index_no
			) {
				return res.status(400).json({
					message:
						"Admission number, birth certificate number, and KCPE index number are required for all students.",
				});
			}
		}

		// Find the cohort object in the students array
		let cohortGroup = school.students.find(
			(group) => group.cohort === cohort
		);

		if (!cohortGroup) {
			// If the cohort doesn't exist, create a new cohort group
			cohortGroup = { cohort, students: [] };
			school.students.push(cohortGroup);
		}
		// Save the updated school document
		await school.save();

		// Check for duplicates before adding students
		for (const student of studentsData) {
			const isDuplicate = cohortGroup.students.some(
				(existingStudent) =>
					existingStudent.adm_no === student.adm_no ||
					existingStudent.birth_cert_no === student.birth_cert_no ||
					existingStudent.kcpe_index_no === student.kcpe_index_no
			);

			if (isDuplicate) {
				return res.status(400).json({
					message: `Duplicate student found: adm_no ${student.adm_no}, birth_cert_no ${student.birth_cert_no}, or kcpe_index_no ${student.kcpe_index_no}`,
				});
			}
		}

		// Add the new students to the selected cohort
		cohortGroup.students.push(...studentsData);

		// Save the updated school document
		await school.save();

		res.status(200).json({
			message: `Successfully uploaded ${studentsData.length} student records.`,
		});
	} catch (error) {
		console.error("Error uploading students:", error);
		res.status(500).json({ message: "Failed to upload student data." });
	}
};

exports.uploadTeachers = async (req, res) => {
	try {
		const { schoolId, teachersData } = req.body;

		if (!schoolId) {
			return res.status(400).json({ message: "School ID is required." });
		}

		if (!Array.isArray(teachersData) || teachersData.length === 0) {
			return res
				.status(200)
				.json({ message: "No teacher data to upload." });
		}

		const school = await School.findOne({ schoolId: schoolId });
		if (!school) {
			return res.status(404).json({ message: "School not found." });
		}

		const existingEmployeeNumbers = school.teachers.map(
			(teacher) => teacher.employee_number
		);
		const existingNationalIds = school.teachers.map(
			(teacher) => teacher.national_id
		);

		const newTeachers = [];
		const duplicates = [];

		// Basic validation for required fields
		for (const teacher of teachersData) {
			if (!teacher.employee_number) {
				return res.status(400).json({
					message: "Employee number is required for all teachers.",
				});
			}
			if (!teacher.kra_pin) {
				return res
					.status(400)
					.json({ message: "KRA PIN is required for all teachers." });
			}
			if (!teacher.national_id) {
				return res.status(400).json({
					message: "National ID is required for all teachers.",
				});
			}
			if (!teacher.first_name) {
				return res.status(400).json({
					message: "First name is required for all teachers.",
				});
			}
			if (!teacher.middle_name) {
				return res.status(400).json({
					message: "Middle name is required for all teachers.",
				});
			}
			if (!teacher.surname) {
				return res
					.status(400)
					.json({ message: "Surname is required for all teachers." });
			}
			if (
				!teacher.subjects_taught ||
				!Array.isArray(teacher.subjects_taught) ||
				teacher.subjects_taught.length === 0
			) {
				return res.status(400).json({
					message:
						"At least one subject taught is required for all teachers.",
				});
			}

			const isDuplicateEmployeeNumber = existingEmployeeNumbers.includes(
				teacher.employee_number
			);
			const isDuplicateNationalId =
				teacher.national_id &&
				existingNationalIds.includes(teacher.national_id);

			if (isDuplicateEmployeeNumber || isDuplicateNationalId) {
				duplicates.push({
					employee_number: teacher.employee_number,
					national_id: teacher.national_id,
					reason: isDuplicateEmployeeNumber
						? isDuplicateNationalId
							? "Employee number and National ID already exist"
							: "Employee number already exists"
						: "National ID already exists",
				});
			} else {
				newTeachers.push(teacher);
			}
		}
		if (newTeachers.length > 0) {
			school.teachers.push(...newTeachers);
			await school.save();
			const uploadCount = newTeachers.length;
			const duplicateCount = duplicates.length;
			const message = `Successfully uploaded ${uploadCount} new teacher(s). ${duplicateCount} duplicate record(s) were skipped.`;
			return res.status(200).json({ message, duplicates });
		} else {
			return res.status(200).json({
				message:
					"No new teachers to upload. All provided records appear to be duplicates.",
				duplicates,
			});
		}
	} catch (error) {
		console.error("Error uploading teachers:", error);
		res.status(500).json({ message: "Failed to upload teacher data." });
	}
};

exports.getSchoolStudents = async (req, res) => {
	try {
		const { schoolId } = req.params;

		const school = await School.findOne({ schoolId: schoolId });
		if (!school) {
			return res.status(404).json({ message: "School not found." });
		}
		const students = school?.students;

		res.status(200).json({ students: students });
	} catch (error) {
		console.error("Error fetching school students:", error);
		res.status(500).json({
			message: "Failed to fetch school students.",
			error: error.message,
		});
	}
};

exports.getSchoolTeachers = async (req, res) => {
	try {
		const { schoolId } = req.params;
		const school = await School.findOne({ schoolId: schoolId });
		if (!school)
			return res.status(404).json({ message: "School not found" });

		const teachers = school?.teachers;

		res.status(200).json({ teachers: teachers });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};

exports.updateStudent = async (req, res) => {
	try {
		const { studentId } = req.params;
		const updatedData = req.body;

		// Find the school and the specific student within its cohorts
		const school = await School.findOne({
			"students.students.adm_no": studentId,
		});
		if (!school) {
			return res
				.status(404)
				.json({ message: `Student ${studentId} not found.` });
		}

		// Find the specific student sub-document and update its properties
		let updatedStudent;
		school.students.forEach((cohort) => {
			const student = cohort.students.find((s) => s.adm_no === studentId);
			if (student) {
				Object.assign(student, updatedData);
				updatedStudent = student;
			}
		});

		await school.save(); // Save the changes to the school document

		res.status(200).json({
			updatedStudent: updatedStudent,
			message: "Student Details Updated Successfully",
		});
	} catch (error) {
		console.error("Error updating student:", error);
		res.status(500).json({
			message: "Failed to update student.",
			error: error.message,
		});
	}
};

exports.updateTeacher = async (req, res) => {
	const { schoolId } = req.params;
	const updatedData = req.body.teacherData;

	try {
		const school = await School.findOne({ schoolId });

		if (!school) {
			return res.status(404).json({ message: "School not found" });
		}
		// Find and update the teacher
		let updatedTeacher;
		school.teachers.forEach((teacher) => {
			if (teacher.national_id == updatedData.national_id) {
				Object.assign(teacher, updatedData);
				updatedTeacher = teacher;
			}
		});
		if (updatedTeacher) {
			await school.save(); // Persist changes

			res.status(200).json({
				updatedTeacher: updatedTeacher,
				message: "Teacher Details Updated Successfully",
			});
		} else {
			return res.status(404).json({ message: "Teacher not found" });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Server error while updating teacher",
		});
	}
};
