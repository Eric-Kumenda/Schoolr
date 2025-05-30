const { default: mongoose } = require("mongoose");
const { School, Student, Teacher } = require("../models/newSchoolModel");
const supabase = require("../supabaseClient");

//Query School
exports.querySchool = async (req, res) => {
	const { schoolId } = req.params;
	try {
		const school = await School.findOne({ schoolId: schoolId });

		if (!school) {
			return res.status(404).json({ message: "School not found" });
		}
		const schoolObjectId = school._id;
		// Get total student count
		const totalStudentsResult = await Student.aggregate([
			{ $match: { schoolId: schoolObjectId } },
			{ $count: "totalStudents" }, // Use $count to get the count of matched documents
		]);

		// Get total teacher count
		const totalTeachersResult = await Teacher.aggregate([
			{ $match: { schoolId: schoolObjectId } },
			{ $count: "totalTeachers" }, // Use $count to get the count of matched documents
		]);

		// Extract counts (default to 0 if no results)
		const totalStudents =
			totalStudentsResult.length > 0
				? totalStudentsResult[0].totalStudents
				: 0;
		const totalTeachers =
			totalTeachersResult.length > 0
				? totalTeachersResult[0].totalTeachers
				: 0;

		res.status(200).json({
			totalStudents: totalStudents,
			totalTeachers: totalTeachers,
			message: "School Query Successful",
		});
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
		const schoolObjectId = school._id;

		const newStudentsToInsert = [];
		const duplicates = [];

		// Fetch existing students by adm_no, birth_cert_no, kcpe_index_no for the current school
		const existingStudents = await Student.find({
			schoolId: schoolObjectId,
			$or: [
				{ adm_no: { $in: studentsData.map((s) => s.adm_no) } },
				{
					birth_cert_no: {
						$in: studentsData.map((s) => s.birth_cert_no),
					},
				},
				{
					kcpe_index_no: {
						$in: studentsData.map((s) => s.kcpe_index_no),
					},
				},
			],
		}).select("adm_no birth_cert_no kcpe_index_no");

		const existingAdmNos = new Set(existingStudents.map((s) => s.adm_no));
		const existingBirthCertNos = new Set(
			existingStudents.map((s) => s.birth_cert_no)
		);
		const existingKcpeIndexNos = new Set(
			existingStudents.map((s) => s.kcpe_index_no)
		);

		for (const student of studentsData) {
			// Basic validation
			if (
				!student.adm_no ||
				!student.birth_cert_no ||
				!student.kcpe_index_no ||
				!student.first_name ||
				!student.surname
			) {
				duplicates.push({
					data: student,
					reason: "Missing required fields (adm_no, birth_cert_no, kcpe_index_no, first_name, surname)",
				});
				continue; // Skip this student
			}

			const isDuplicate =
				existingAdmNos.has(student.adm_no) ||
				existingBirthCertNos.has(student.birth_cert_no) ||
				existingKcpeIndexNos.has(student.kcpe_index_no);

			if (isDuplicate) {
				duplicates.push({
					data: student,
					reason: `Duplicate found by adm_no (${student.adm_no}), birth_cert_no (${student.birth_cert_no}), or kcpe_index_no (${student.kcpe_index_no})`,
				});
			} else {
				newStudentsToInsert.push({
					...student,
					schoolId: schoolObjectId,
				});
			}
		}

		if (newStudentsToInsert.length > 0) {
			const insertedStudents = await Student.insertMany(
				newStudentsToInsert,
				{ ordered: false }
			); // Insert many, continue on error
			res.status(200).json({
				message: `Successfully uploaded ${insertedStudents.length} new student records.`,
				duplicates: duplicates,
				uploadedCount: insertedStudents.length,
				skippedCount: duplicates.length,
			});
		} else {
			res.status(200).json({
				message:
					"No new students to upload. All provided records appear to be duplicates or invalid.",
				duplicates: duplicates,
				uploadedCount: 0,
				skippedCount: duplicates.length,
			});
		}
	} catch (error) {
		console.error("Error uploading students:", error);
		// Handle potential duplicate key errors from insertMany if not using the pre-check
		if (error.code === 11000) {
			// Duplicate key error
			return res.status(400).json({
				message:
					"One or more students could not be uploaded due to duplicate unique fields (e.g., adm_no, birth_cert_no, kcpe_index_no).",
				error: error.message,
			});
		}
		res.status(500).json({
			message: "Failed to upload student data.",
			error: error.message,
		});
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

		const schoolExists = await School.findOne({ schoolId: schoolId });
		if (!schoolExists) {
			return res
				.status(404)
				.json({ message: "Associated school not found." });
		}
		const schoolObjectId = schoolExists._id;

		const newTeachersToInsert = [];
		const duplicates = [];

		// Fetch existing teachers for the current school
		const existingTeachers = await Teacher.find({
			schoolId: schoolObjectId,
			$or: [
				{
					employee_number: {
						$in: teachersData.map((t) => t.employee_number),
					},
				},
				{
					national_id: {
						$in: teachersData.map((t) => t.national_id),
					},
				},
			],
		}).select("employee_number national_id");

		const existingEmployeeNumbers = new Set(
			existingTeachers.map((t) => t.employee_number)
		);
		const existingNationalIds = new Set(
			existingTeachers.map((t) => t.national_id)
		);

		for (const teacher of teachersData) {
			// Basic validation
			if (
				!teacher.employee_number ||
				!teacher.kra_pin ||
				!teacher.national_id ||
				!teacher.first_name ||
				!teacher.surname ||
				!teacher.subjects_taught ||
				!Array.isArray(teacher.subjects_taught) ||
				teacher.subjects_taught.length === 0
			) {
				duplicates.push({
					data: teacher,
					reason: "Missing required fields (employee_number, kra_pin, national_id, first_name, surname, subjects_taught)",
				});
				continue;
			}

			const isDuplicate =
				existingEmployeeNumbers.has(teacher.employee_number) ||
				existingNationalIds.has(teacher.national_id);

			if (isDuplicate) {
				duplicates.push({
					data: teacher,
					reason: `Duplicate found by employee number (${teacher.employee_number}) or National ID (${teacher.national_id})`,
				});
			} else {
				newTeachersToInsert.push({
					...teacher,
					schoolId: schoolObjectId, // Crucially link to the school
				});
			}
		}

		if (newTeachersToInsert.length > 0) {
			const insertedTeachers = await Teacher.insertMany(
				newTeachersToInsert,
				{ ordered: false }
			);
			res.status(200).json({
				message: `Successfully uploaded ${insertedTeachers.length} new teacher(s).`,
				duplicates: duplicates,
				uploadedCount: insertedTeachers.length,
				skippedCount: duplicates.length,
			});
		} else {
			res.status(200).json({
				message:
					"No new teachers to upload. All provided records appear to be duplicates or invalid.",
				duplicates: duplicates,
				uploadedCount: 0,
				skippedCount: duplicates.length,
			});
		}
	} catch (error) {
		console.error("Error uploading teachers:", error);
		if (error.code === 11000) {
			// Duplicate key error
			return res.status(400).json({
				message:
					"One or more teachers could not be uploaded due to duplicate unique fields (e.g., employee_number, national_id).",
				error: error.message,
			});
		}
		res.status(500).json({
			message: "Failed to upload teacher data.",
			error: error.message,
		});
	}
};

exports.getSchoolStudents = async (req, res) => {
	try {
		const { schoolId } = req.params;

		const school = await School.findOne({ schoolId: schoolId });
		if (!school) {
			return res.status(404).json({ message: "School not found." });
		}
		const schoolObjectId = school._id;
		const students = await Student.find({ schoolId: schoolObjectId }).sort({
			cohort: 1,
			adm_no: 1,
		});

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

		const schoolObjectId = school._id;
		const teachers = await Teacher.find({ schoolId: schoolObjectId });

		res.status(200).json({ teachers: teachers });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: `Server error: ${error}` });
	}
};

exports.updateStudent = async (req, res) => {
	try {
		const { studentId } = req.params;
		const updatedData = req.body;
		const schoolObjectId = updatedData.schoolId;

		if (!schoolObjectId) {
			return res.status(400).json({
				message: "School ID (from authenticated user) is required.",
			});
		}

		// Find the student by _id AND ensure they belong to the authenticated school
		const updatedStudent = await Student.findOneAndUpdate(
			{ _id: studentId, schoolId: schoolObjectId }, // Find by student's _id and schoolId
			{ $set: updatedData }, // Apply updates using $set
			{ new: true, runValidators: true } // Return the updated document and run schema validators
		);

		if (!updatedStudent) {
			return res.status(404).json({
				message: `Student with ID ${studentId} not found in this school.`,
			});
		}

		res.status(200).json({
			updatedStudent: updatedStudent,
			message: "Student Details Updated Successfully",
		});
	} catch (error) {
		console.error("Error updating student:", error);
		// Handle specific validation errors if runValidators is true
		if (error.name === "ValidationError") {
			return res
				.status(400)
				.json({ message: error.message, errors: error.errors });
		}
		// Handle unique constraint errors (e.g., if trying to change adm_no to an existing one)
		if (error.code === 11000) {
			return res.status(400).json({
				message:
					"A student with this unique identifier already exists.",
				error: error.message,
			});
		}
		res.status(500).json({
			message: "Failed to update student.",
			error: error.message,
		});
	}
};

exports.updateTeacher = async (req, res) => {
	const { teacherId } = req.params;
	const updatedData = req.body;
	const schoolObjectId = updatedData.schoolId;

	try {
		if (!schoolObjectId) {
			return res.status(400).json({
				message: "School ID (from authenticated user) is required.",
			});
		}

		// Find the teacher by _id AND ensure they belong to the authenticated school
		const updatedTeacher = await Teacher.findOneAndUpdate(
			{ _id: teacherId, schoolId: schoolObjectId },
			{ $set: updatedData },
			{ new: true, runValidators: true }
		);

		if (!updatedTeacher) {
			return res.status(404).json({
				message: `Teacher with ID ${teacherId} not found in this school.`,
			});
		}

		res.status(200).json({
			updatedTeacher: updatedTeacher,
			message: "Teacher Details Updated Successfully",
		});
	} catch (error) {
		console.error("Error updating teacher:", error);
		if (error.name === "ValidationError") {
			return res
				.status(400)
				.json({ message: error.message, errors: error.errors });
		}
		if (error.code === 11000) {
			return res.status(400).json({
				message:
					"A teacher with this unique identifier (employee_number or national_id) already exists.",
				error: error.message,
			});
		}
		res.status(500).json({
			message: "Failed to update teacher.",
			error: error.message,
		});
	}
};

// New function to link a user (teacher, finance, student, parent) to a school
exports.linkUserToSchool = async (req, res) => {
	try {
		const { email, role, isVerified, adm } = req.body;
		const schoolId = req.user.schoolId; // Comes from requireAdmin middleware, which extracts from JWT

		if (!email || !role) {
			return res
				.status(400)
				.json({ message: "Email and Role are required." });
		}

		// Basic validation for role
		const allowedRoles = [
			"teacher",
			"finance",
			"student",
			"parent",
			"admin",
		];
		if (!allowedRoles.includes(role)) {
			return res.status(400).json({
				message: `Invalid role: ${role}. Allowed roles are: ${allowedRoles.join(
					", "
				)}.`,
			});
		}

		// 1. Find the user in Supabase by email
		// Note: Supabase's auth.users table is typically what you'd manage with the admin client.
		// If you have a separate `public.users` table, you query that.
		// Assuming your `public.users` table holds `email`, `role`, `schoolId`, `isVerified`
		const { data: user, error: findError } = await supabase
			.from("users") // Your Supabase table name where user roles and schoolId are stored
			.select("id, email") // Select only what's needed for identification
			.eq("email", email)
			.single();

		if (findError) {
			console.error("Supabase user find error:", findError);
			if (findError.code === "PGRST116") {
				// No rows found (specific to PostgREST for single())
				return res.status(404).json({
					message: `User with email ${email} not found in Supabase.`,
				});
			}
			return res.status(500).json({
				message: `Error finding user in Supabase: ${findError.message}`,
			});
		}

		if (!user) {
			return res
				.status(404)
				.json({ message: `User with email ${email} not found.` });
		}

		let studentId, stud;
		if (role === "student") {
			const studentDocument = await Student.findOne({ adm_no: adm });
			if (!studentDocument) {
				return res
					.status(404)
					.json({ message: `Student with adm_no ${adm} not found` });
			}
			stud = studentDocument;
			studentId = studentDocument._id;
		}

		// 2. Update the user's record in Supabase
		const { data: updatedUser, error: updateError } = await supabase
			.from("users") // Same table
			.update({
				role: role,
				schoolId: schoolId.toString(), // Store MongoDB ObjectId as a string in Supabase
				isVerified: !!isVerified, // Ensure it's a boolean
				studentId: studentId ? studentId : null,
			})
			.eq("id", user.id) // Update by Supabase user ID
			.select(); // Return the updated record

		if (updateError) {
			console.error("Supabase user update error:", updateError);
			return res.status(500).json({
				message: `Failed to update user in Supabase: ${updateError.message}`,
			});
		}

		res.status(200).json({
			message: `User ${email} successfully linked to school with role ${role}${
				role === "student"
					? " and Adm No: " +
					  stud.adm_no +
					  " Name: " +
					  stud.first_name
					: null
			}.`,
			user: updatedUser[0], // Supabase update returns an array for select()
		});
	} catch (error) {
		console.error("Error linking user to school:", error);
		res.status(500).json({
			message: "Server error linking user to school.",
			error: error.message,
		});
	}
};

// New function to get school payment details
exports.getSchoolPaymentDetails = async (req, res) => {
	try {
		const schoolId = req.user.schoolObjectId; // Assuming schoolId from authentication middleware

		if (!schoolId) {
			return res.status(400).json({ message: "School ID not found." });
		}

		// Fetch school's payment details
		const school = await School.findById(schoolId, "paymentDetails").lean();
		const paymentDetails = school ? school.paymentDetails : {};

		res.status(200).json(paymentDetails);
	} catch (error) {
		console.error("Error fetching school payment details:", error);
		res.status(500).json({
			message: "Failed to fetch school payment details.",
			error: error.message,
		});
	}
};

// New function to update school payment details
exports.updateSchoolPaymentDetails = async (req, res) => {
	try {
		const schoolId = req.user.schoolObjectId; // Assuming schoolId from authentication middleware
		const { paymentDetails } = req.body; // Payment details will be sent in the request body

		if (!schoolId) {
			return res.status(400).json({ message: "School ID not found." });
		}

		// Find the school and update its paymentDetails field
		const updatedSchool = await School.findOneAndUpdate(
			{ _id: new mongoose.Types.ObjectId(schoolId) },
			{ $set: { paymentDetails: paymentDetails } },
			{ new: true, runValidators: true } // Return the updated document and run schema validators
		);

		if (!updatedSchool) {
			return res.status(404).json({ message: "School not found." });
		}

		res.status(200).json({
			message: "School payment details updated successfully.",
			paymentDetails: updatedSchool.paymentDetails, // Return the updated payment details
		});
	} catch (error) {
		console.error("Error updating school payment details:", error);
		res.status(500).json({
			message: "Failed to update school payment details.",
			error: error.message,
		});
	}
};
