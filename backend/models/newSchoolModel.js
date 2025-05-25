const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types; // For creating references

const transactionSchema = new mongoose.Schema(
	{
		studentId: {
			type: ObjectId,
			ref: "Student",
			required: true,
			index: true,
		},
		transactionType: {
			type: String,
			enum: ["BILLING", "PAYMENT"],
			required: true,
			index: true,
		},
		description: { type: String, required: true },
		amount: { type: Number, required: true }, // Positive for billing, negative for payment
		transactionDate: { type: Date, default: Date.now, index: true },
		paymentMethod: { type: String }, // e.g., "MPesa", "Stripe", "Cash"
		reference: { type: String }, // MPesa transaction ID, etc.
		createdBy: { type: String }, // Reference to the admin who created it
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const billingSchema = new mongoose.Schema(
	{
		billingCode: {
			type: String,
			required: true,
			unique: true,
			index: true,
		}, // Unique code
		description: { type: String, required: true },
		amount: { type: Number, required: true },
		cohort: { type: String, index: true }, // Optional: Apply to a whole cohort
		studentIds: [{ type: ObjectId, ref: "Student", index: true }], // Optional: Specific students
		billingDate: { type: Date, default: Date.now, index: true },
		dueDate: { type: Date },
		createdBy: { type: String, required: true },
		schoolId: {
			type: ObjectId,
			ref: "School",
			required: true,
			index: true,
		}, // Link to the school
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

// AttendanceRecord Schema
// Represents a single student's attendance status for a specific day
const attendanceRecordSchema = new mongoose.Schema(
    {
        schoolId: { type: ObjectId, ref: 'School', required: true, index: true },
        studentId: { type: ObjectId, ref: 'Student', required: true, index: true },
        academicYear: { type: Number, required: true, index: true }, // e.g., 2024
        term: { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true, index: true },
        attendanceDate: { type: Date, required: true, index: true }, // Specific date of attendance
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late', 'Excused'], // You can expand these statuses
            default: 'Present',
            required: true,
        },
        recordedBy: { type: ObjectId, ref: 'User', required: true }, // Teacher/Admin who recorded it
        remarks: { type: String }, // Optional notes for absence/lateness
        // Add fields for class/stream if you want to explicitly log where attendance was taken
        // Although linking via studentId might be enough as student has cohort/stream
        // studentCohort: { type: String }, // Denormalized for quick filtering
        // studentStream: { type: String }, // Denormalized for quick filtering
    },
    { timestamps: true } // createdAt, updatedAt for when the record was created/modified
);

// Add a unique compound index to prevent duplicate records for the same student on the same day
attendanceRecordSchema.index({ schoolId: 1, studentId: 1, attendanceDate: 1 }, { unique: true });

const parentSchema = new mongoose.Schema(
	{
		userId: { type: ObjectId, ref: "User", index: true }, // If using a separate user model
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		contactNumber: { type: String },
		email: { type: String },
		studentIds: [{ type: ObjectId, ref: "Student", index: true }], // Students they are responsible for
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const studentSchema = new mongoose.Schema(
	{
		adm_no: { type: String, required: true },
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
		subjects: [String], // Array of subjects the student is taking
		transactions: [{ type: ObjectId, ref: "Transaction" }], // Link to student's transactions
		parentIds: [{ type: ObjectId, ref: "Parent" }], // Link to student's parents
		accountBalance: { type: Number, default: 0 }, // Add account balance here
		schoolId: {
			type: ObjectId,
			ref: "School",
			required: true,
			index: true,
		}, // Link to the school
		//examResults: [{ type: ObjectId, ref: 'ExamResult' }]
		// You might want to add relationships to other models later (e.g., class)
	},
	{ timestamps: true }
);

const teacherSchema = new mongoose.Schema(
	{
		employee_number: { type: String, required: true, unique: true },
		kra_pin: String,
		national_id: String,
		first_name: String,
		middle_name: String,
		surname: String,
		subjects_taught: [String], // Array of subjects the teacher teaches
		schoolId: {
			type: ObjectId,
			ref: "School",
			required: true,
			index: true,
		}, // Link to the school
		// You might want to add relationships (e.g., to classes taught)
	},
	{ timestamps: true }
);

// Exam Schema
// Represents a specific exam event (e.g., "Term 1 Exams 2024")
const examSchema = new mongoose.Schema(
	{
		schoolId: {
			type: ObjectId,
			ref: "School",
			required: true,
			index: true,
		},
		examName: { type: String, required: true }, // e.g., "Term 1 Exams 2024", "Mid-Term Assessment"
		academicYear: { type: Number, required: true }, // e.g., 2024
		term: {
			type: String,
			enum: ["Term 1", "Term 2", "Term 3"],
			required: true,
		},
		examDate: { type: Date, default: Date.now }, // Date the exam was administered/finalized
		status: {
			type: String,
			enum: ["provisional", "official"],
			default: "provisional",
			required: true,
			index: true,
		},
		createdBy: { type: String, required: true }, // Admin who created the exam record
		publishedBy: String, // Admin who set it to official
		publishedAt: { type: Date },
	},
	{ timestamps: true }
);

// ExamResult Schema
// Now links to an Exam document instead of being directly embedded in School
const examResultSchema = new mongoose.Schema(
	{
		examId: { type: ObjectId, ref: "Exam", required: true, index: true }, // Link to the specific exam event
		studentId: {
			type: ObjectId,
			ref: "Student",
			required: true,
			index: true,
		}, // Explicit link to student
		adm_no: { type: String, required: true, index: true }, // Keep for quick lookup/denormalization
		subject: { type: String, required: true },
		marks: { type: Number, min: 0, max: 100 }, // Marks for the subject
		grade: { type: String }, // Calculated grade (can be done on backend or frontend)
		comment: { type: String }, // Optional comment by teacher/admin for this subject's result
		schoolId: {
			type: ObjectId,
			ref: "School",
			required: true,
			index: true,
		}, // Link to the school
		lastUpdatedBy: { type: String, required: true }, // Teacher/Admin who last updated it
		lastUpdatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const schoolSchema = new mongoose.Schema(
	{
		schoolId: { type: String, required: true, unique: true },
		paymentDetails: {
			mpesaPaybillNumber: { type: String },
			mpesaAccountNameFormat: { type: String, default: "ADM_NO" }, // e.g., "ADM_NO", "STUDENTNAME", "INVOICE_ID"
			bankName: { type: String },
			bankAccountNumber: { type: String },
			bankAccountName: { type: String },
			// Add fields for any other payment methods the school uses
		},
		//
		// No direct embedding of finance data in the School schema anymore
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
const Billing = mongoose.model("Billing", billingSchema);
const Parent = mongoose.model("Parent", parentSchema);
const Student = mongoose.model("Student", studentSchema);
const Teacher = mongoose.model("Teacher", teacherSchema);
const Exam = mongoose.model("Exam", examSchema);
const ExamResult = mongoose.model("ExamResult", examResultSchema);
const School = mongoose.model("School", schoolSchema);
const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);

module.exports = {
	School,
	Student,
	Teacher,
	ExamResult,
	Transaction,
	Billing,
	Parent,
	Exam,
	ExamResult,
	AttendanceRecord
};
