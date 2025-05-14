const School = require("../models/School");
const supabase = require("../supabaseClient");

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
		console.log(...studentsData);

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
