const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types; // For creating references

const transactionSchema = new mongoose.Schema(
    {
        studentId: { type: ObjectId, ref: 'Student', required: true, index: true },
        transactionType: {
            type: String,
            enum: ['BILLING', 'PAYMENT'],
            required: true,
            index: true,
        },
        description: { type: String, required: true },
        amount: { type: Number, required: true }, // Positive for billing, negative for payment
        transactionDate: { type: Date, default: Date.now, index: true },
        paymentMethod: { type: String }, // e.g., "MPesa", "Stripe", "Cash"
        reference: { type: String }, // MPesa transaction ID, Stripe charge ID, etc.
        createdBy: { type: ObjectId, ref: 'Admin' }, // Reference to the admin who created it
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const billingSchema = new mongoose.Schema(
    {
        billingCode: { type: String, required: true, unique: true, index: true }, // Unique code
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        cohort: { type: String, index: true }, // Optional: Apply to a whole cohort
        studentIds: [{ type: ObjectId, ref: 'Student', index: true }], // Optional: Specific students
        billingDate: { type: Date, default: Date.now, index: true },
        dueDate: { type: Date },
        createdBy: { type: ObjectId, ref: 'Admin', required: true },
        schoolId: { type: ObjectId, ref: 'School', required: true, index: true }, // Link to the school
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const parentSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'User', index: true }, // If using a separate user model
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        contactNumber: { type: String },
        email: { type: String },
        studentIds: [{ type: ObjectId, ref: 'Student', index: true }], // Students they are responsible for
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

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
        subjects: [String], // Array of subjects the student is taking
        transactions: [{ type: ObjectId, ref: 'Transaction' }], // Link to student's transactions
        parentIds: [{ type: ObjectId, ref: 'Parent' }], // Link to student's parents
        accountBalance: { type: Number, default: 0 }, // Add account balance here
        schoolId: { type: ObjectId, ref: 'School', required: true, index: true }, // Link to the school
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
        schoolId: { type: ObjectId, ref: 'School', required: true, index: true }, // Link to the school
        // You might want to add relationships (e.g., to classes taught)
    },
    { timestamps: true }
);

const examResultSchema = new mongoose.Schema(
    {
        exam_name: { type: String, required: true },
        cohort: { type: String, required: true },
        subject: { type: String, required: true },
        adm_no: { type: String, required: true }, // Link to student (by adm_no for now, consider ref later)
        marks: Number,
        grade: String,
        schoolId: { type: ObjectId, ref: 'School', required: true, index: true }, // Link to the school
        // You might want to add a reference to the exam event itself
    },
    { timestamps: true }
);

const schoolSchema = new mongoose.Schema(
    {
        schoolId: { type: String, required: true, unique: true },
        students: [
            {
                cohort: { type: String, required: true }, // e.g., "2023"
                students: [studentSchema], // List of students in this cohort (now includes finance fields)
            },
        ],
        teachers: [teacherSchema], // Array of teacher objects
        exam_results: [examResultSchema], // Array of exam result objects
        // No direct embedding of finance data in the School schema anymore
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
const Billing = mongoose.model("Billing", billingSchema);
const Parent = mongoose.model("Parent", parentSchema);
const Student = mongoose.model("Student", studentSchema); // Re-define Student model with new fields
const Teacher = mongoose.model("Teacher", teacherSchema);
const ExamResult = mongoose.model("ExamResult", examResultSchema);
const School = mongoose.model("School", schoolSchema);

module.exports = { School, Student, Teacher, ExamResult, Transaction, Billing, Parent };