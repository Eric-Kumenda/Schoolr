// const mongoose = require("mongoose");

// const studentSchema = new mongoose.Schema(
// 	{
// 		adm_no: { type: String, required: true, unique: true },
// 		first_name: String,
// 		middle_name: String,
// 		surname: String,
// 		birth_cert_no: String,
// 		DOB: Date,
// 		kcpe_index_no: String,
// 		kcpe_year: Number,
// 		current_study_year: Number,
// 		stream: String,
// 		cohort: String,
// 		house: String,
// 		dorm: String,
// 		cube: String,
// 		nemis_no: String,
// 		nhif_no: String,
// 		subjects: [String], // Array of subjects the student is taking
// 		// You might want to add relationships to other models later (e.g., class)
// 	},
// 	{ timestamps: true }
// );

// const teacherSchema = new mongoose.Schema(
// 	{
// 		employee_number: { type: String, required: true, unique: true },
// 		kra_pin: String,
// 		national_id: String,
// 		first_name: String,
// 		middle_name: String,
// 		surname: String,
// 		subjects_taught: [String], // Array of subjects the teacher teaches
// 		// You might want to add relationships (e.g., to classes taught)
// 	},
// 	{ timestamps: true }
// );

// const examResultSchema = new mongoose.Schema(
// 	{
// 		exam_name: { type: String, required: true },
// 		cohort: { type: String, required: true },
// 		subject: { type: String, required: true },
// 		adm_no: { type: String, required: true }, // Link to student
// 		marks: Number,
// 		grade: String,
// 		// You might want to add a reference to the exam event itself
// 	},
// 	{ timestamps: true }
// );

// const schoolSchema = new mongoose.Schema(
// 	{
// 		schoolId: { type: String, required: true, unique: true },
// 		students: [
// 			{
// 				cohort: { type: String, required: true }, // e.g., "2023"
// 				students: [studentSchema], // List of students in this cohort
// 			},
// 		],
// 		teachers: [teacherSchema], // Array of teacher objects (embedded) - Consider pros/cons of embedding vs. referencing
// 		exam_results: [examResultSchema], // Array of exam result objects
// 		// Finance data can be a separate model with a reference to the School
// 	},
// 	{ timestamps: true }
// );

// const School = mongoose.model("School", schoolSchema);

// module.exports = School;
