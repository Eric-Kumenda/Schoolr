const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
	{
		adm_no: { type: String, required: true, unique: true },
		first_name: String,
		middle_name: String,
		surname: String,
		birth_cert_no: String,
		DOB: Date,
		kcpe_index_no: String,
		kcpe_year: Number,
		current_study_year: Number,
		stream: String,
		cohort: String,
		house: String,
		dorm: String,
		cube: String,
		nemis_no: String,
		nhif_no: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
