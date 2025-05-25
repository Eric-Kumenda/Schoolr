// middleware/canViewStudentFinance.js

const { Student, Parent } = require('../models'); // Adjust path

const canViewStudentFinance = async (req, res, next) => {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const schoolId = req.user.schoolId;

    try {
        const student = await Student.findOne({ _id: studentId, schoolId: schoolId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (userRole === 'admin') {
            return next(); // Admin can view all
        }

        if (userRole === 'parent') {
            const parent = await Parent.findOne({ userId: userId, studentIds: studentId });
            if (parent) {
                return next(); // Parent is linked to the student
            }
            return res.status(403).json({ message: 'Not authorized to view this student\'s finance.' });
        }

        if (userRole === 'teacher') {
            // Logic to check if the teacher is associated with this student (e.g., through a class)
            // This will depend on how you structure your teacher-student relationships
            // For now, we'll just allow (you'll need to implement the actual check)
            return next();
            // Example:
            // const isTeacherOfStudent = await Class.findOne({ teachers: userId, students: studentId });
            // if (isTeacherOfStudent) {
            //     return next();
            // }
            // return res.status(403).json({ message: 'Not authorized to view this student\'s finance.' });
        }

        return res.status(403).json({ message: 'Not authorized to view this student\'s finance.' });

    } catch (error) {
        console.error('Error in canViewStudentFinance middleware:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = canViewStudentFinance;