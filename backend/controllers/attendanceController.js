const { default: mongoose } = require('mongoose');
const { Student, AttendanceRecord, School, } = require('../models/newSchoolModel'); // Adjust path to your models
const moment = require('moment/moment');

// Helper to get current academic year and term based on date
// You'll need to define how your school terms are determined (e.g., config, fixed dates)
const getCurrentAcademicContext = (date = new Date()) => {
    const year = date.getFullYear();
    let term;
    // Example logic: customize based on your school's academic calendar
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    if (month >= 1 && month <= 3) term = 'Term 1'; // Jan-Mar
    else if (month >= 4 && month <= 8) term = 'Term 2'; // Apr-Aug
    else term = 'Term 3'; // Sep-Dec (Adjust as per actual terms)

    return { academicYear: year, term };
};

// 1. Get Students for Attendance Taking (Teacher/Admin)
// Filters by cohort, stream, and allows checking if attendance is already taken for a date
exports.getStudentsForAttendance = async (req, res) => {
    try {
        const { attendanceDate, cohort, stream } = req.query;
        const schoolId = req.user.schoolObjectId;

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for authenticated user." });
        }
        if (!attendanceDate) {
            return res.status(400).json({ message: "Attendance date is required." });
        }

        const dateObj = new Date(attendanceDate);
        if (isNaN(dateObj)) {
            return res.status(400).json({ message: "Invalid attendance date." });
        }

        let studentQuery = { schoolId };
        if (cohort) studentQuery.cohort = cohort;
        if (stream) studentQuery.stream = stream;

        // Fetch students based on filters
        const students = await Student.find(studentQuery)
            .select('adm_no first_name middle_name surname stream cohort')
            .sort({ cohort: 1, stream: 1, adm_no: 1 });

        // Fetch existing attendance records for these students on this specific date
        const existingAttendance = await AttendanceRecord.find({
            schoolId,
            studentId: { $in: students.map(s => s._id) },
            attendanceDate: dateObj,
        }).select('studentId status remarks');

        // Map existing attendance to student list
        const attendanceMap = new Map();
        existingAttendance.forEach(record => {
            attendanceMap.set(record.studentId.toString(), {
                status: record.status,
                remarks: record.remarks,
            });
        });

        const studentsWithAttendance = students.map(student => ({
            _id: student._id,
            adm_no: student.adm_no,
            first_name: student.first_name,
            middle_name: student.middle_name,
            surname: student.surname,
            stream: student.stream,
            cohort: student.cohort,
            // Pre-populate status if attendance was already taken
            attendance: attendanceMap.get(student._id.toString()) || { status: 'Present', remarks: '' },
        }));

        res.status(200).json({ students: studentsWithAttendance });

    } catch (error) {
        console.error("Error fetching students for attendance:", error);
        res.status(500).json({ message: "Failed to fetch students for attendance.", error: error.message });
    }
};

// 2. Record/Update Batch Attendance (Teacher/Admin)
// Expects an array of { studentId, status, remarks }
exports.recordBatchAttendance = async (req, res) => {
    try {
        const { attendanceDate, attendanceData } = req.body; // attendanceData is an array
        const schoolId = req.user.schoolObjectId;
        const recordedBy = req.user._id;

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for authenticated user." });
        }
        if (!attendanceDate || !attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
            return res.status(400).json({ message: "Attendance date and valid attendance data array are required." });
        }

        const dateObj = new Date(attendanceDate);
        if (isNaN(dateObj)) {
            return res.status(400).json({ message: "Invalid attendance date." });
        }

        const { academicYear, term } = getCurrentAcademicContext(dateObj);

        const operations = attendanceData.map(data => ({
            updateOne: {
                filter: {
                    schoolId,
                    studentId: data.studentId,
                    attendanceDate: dateObj,
                },
                update: {
                    $set: {
                        status: data.status,
                        remarks: data.remarks || '',
                        academicYear,
                        term,
                        recordedBy,
                    },
                },
                upsert: true, // Create if not found, update if found
            },
        }));

        const bulkWriteResult = await AttendanceRecord.bulkWrite(operations);

        // --- Update Student Attendance Summary (CRITICAL) ---
        // This part needs careful consideration for atomicity and performance.
        // For simplicity, we'll re-calculate relevant students' summaries.
        // In a very high-traffic system, you might consider a separate queue/worker for this.

        const studentIdsToUpdate = [...new Set(attendanceData.map(d => d.studentId))];
        const studentsToUpdate = await Student.find({ _id: { $in: studentIdsToUpdate }, schoolId });

        /*for (const student of studentsToUpdate) {
            const records = await AttendanceRecord.find({ studentId: student._id });
            let totalPresent = 0;
            let totalAbsent = 0;
            let totalLate = 0;
            let totalExcused = 0;

            records.forEach(record => {
                if (record.status === 'Present') totalPresent++;
                else if (record.status === 'Absent') totalAbsent++;
                else if (record.status === 'Late') totalLate++;
                else if (record.status === 'Excused') totalExcused++;
            });

            student.attendanceSummary = {
                totalDaysPresent: totalPresent,
                totalDaysAbsent: totalAbsent,
                totalDaysLate: totalLate,
                totalDaysExcused: totalExcused,
                lastAttendanceUpdate: Date.now(),
            };
            await student.save();
        }*/

        res.status(200).json({
            message: "Attendance recorded/updated successfully.",
            bulkWriteResult,
            updatedStudentSummaries: studentsToUpdate.map(s => ({ _id: s._id, summary: s.attendanceSummary })),
        });

    } catch (error) {
        console.error("Error recording batch attendance:", error);
        res.status(500).json({ message: "Failed to record batch attendance.", error: error.message });
    }
};

// 3. Get Daily Attendance Overview (Admin/Teacher)
exports.getDailyAttendanceOverview = async (req, res) => {
    try {
        const { attendanceDate, cohort, stream } = req.query;
        const schoolId = req.user.schoolObjectId;

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for authenticated user." });
        }
        if (!attendanceDate) {
            return res.status(400).json({ message: "Attendance date is required." });
        }

        const dateObj = new Date(attendanceDate);
        if (isNaN(dateObj)) {
            return res.status(400).json({ message: "Invalid attendance date." });
        }

        let query = { schoolId, attendanceDate: dateObj };
        if (cohort) query.cohort = cohort; // If you denormalize cohort/stream on AttendanceRecord
        if (stream) query.stream = stream; // If you denormalize cohort/stream on AttendanceRecord

        const attendanceRecords = await AttendanceRecord.find(query)
            .populate('studentId', 'adm_no first_name surname stream cohort') // Populate student details
            .populate('recordedBy', 'email') // Populate who recorded it
            .sort({ 'studentId.cohort': 1, 'studentId.stream': 1, 'studentId.adm_no': 1 });

        res.status(200).json({ attendanceRecords });

    } catch (error) {
        console.error("Error fetching daily attendance overview:", error);
        res.status(500).json({ message: "Failed to fetch daily attendance overview.", error: error.message });
    }
};

// 4. Get Monthly Attendance Summary for Admin Dashboard Chart (Admin only)
exports.getMonthlyAttendanceSummary = async (req, res) => {
    try {
        const { year, month } = req.query; // e.g., ?year=2024&month=5 (for May)
        const schoolId = req.user.schoolId;

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for authenticated user." });
        }
        if (!year || !month) {
            return res.status(400).json({ message: "Year and month are required for monthly summary." });
        }

        const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
        const endDate = new Date(year, month, 0); // Last day of the month

        const attendanceSummary = await AttendanceRecord.aggregate([
            {
                $match: {
                    schoolId: new mongoose.Types.ObjectId(schoolId), // Convert string to ObjectId for aggregation
                    attendanceDate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$attendanceDate" },
                        status: "$status",
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.day",
                    statuses: {
                        $push: {
                            status: "$_id.status",
                            count: "$count",
                        },
                    },
                },
            },
            {
                $sort: { _id: 1 }, // Sort by day
            },
        ]);

        // Format for charting: [{ day: 1, present: X, absent: Y, late: Z, excused: A }, ...]
        const formattedData = [];
        const daysInMonth = new Date(year, month, 0).getDate(); // Get number of days in the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayData = attendanceSummary.find(d => d._id === i);
            const dailyCounts = { day: i, Present: 0, Absent: 0, Late: 0, Excused: 0 };
            if (dayData) {
                dayData.statuses.forEach(s => {
                    dailyCounts[s.status] = s.count;
                });
            }
            formattedData.push(dailyCounts);
        }

        res.status(200).json({ summary: formattedData });

    } catch (error) {
        console.error("Error fetching monthly attendance summary:", error);
        res.status(500).json({ message: "Failed to fetch monthly attendance summary.", error: error.message });
    }
};

// 5. Get Student Attendance Summary (For Student Profile / Parent View)
exports.getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const schoolId = req.user.schoolObjectId;
        const userRole = req.user.role;
        const userId = req.user.id;

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for authenticated user." });
        }

        let student;
        /*if (userRole === 'parent') {
            const parent = await Parent.findOne({ userId: req.user.id, studentIds: studentId });
            if (!parent) {
                return res.status(403).json({ message: "Not authorized to view this student's attendance." });
            }
            student = await Student.findOne({_id: studentId, schoolId});
        } else*/
         if (userRole === 'student' || userRole === 'parent') {
            student = await Student.findOne({ _id: studentId, schoolId });
            if (!student || student._id.toString() !== studentId) {
                 return res.status(403).json({ message: "Not authorized to view these attendance records." });
            }
        } else if (userRole === 'teacher' || userRole === 'admin') {
            student = await Student.findOne({_id: studentId, schoolId});
            if (!student) {
                return res.status(404).json({ message: "Student not found in this school." });
            }
        } else {
             return res.status(403).json({ message: "Unauthorized role to view attendance." });
        }

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // --- NEW LOGIC: Calculate summary using aggregation ---
        const attendanceSummary = await AttendanceRecord.aggregate([
            {
                $match: {
                    schoolId: new mongoose.Types.ObjectId(schoolId),
                    studentId: new mongoose.Types.ObjectId(studentId),
                },
            },
            {
                $group: {
                    _id: '$status', // Group by status
                    count: { $sum: 1 }, // Count occurrences of each status
                },
            },
        ]);

        const formattedSummary = {
            totalDaysPresent: 0,
            totalDaysAbsent: 0,
            totalDaysLate: 0,
            totalDaysExcused: 0,
            lastAttendanceUpdate: null, // We'll try to find the last record date
        };

        attendanceSummary.forEach(item => {
            if (item._id === 'Present') formattedSummary.totalDaysPresent = item.count;
            else if (item._id === 'Absent') formattedSummary.totalDaysAbsent = item.count;
            else if (item._id === 'Late') formattedSummary.totalDaysLate = item.count;
            else if (item._id === 'Excused') formattedSummary.totalDaysExcused = item.count;
        });

        // Find the last attendance record date for this student
        const latestRecord = await AttendanceRecord.findOne({
            schoolId: new mongoose.Types.ObjectId(schoolId),
            studentId: new mongoose.Types.ObjectId(studentId),
        }).sort({ attendanceDate: -1, createdAt: -1 }).select('attendanceDate');

        if (latestRecord) {
            formattedSummary.lastAttendanceUpdate = latestRecord.attendanceDate;
        }

        res.status(200).json({
            studentId: student._id,
            adm_no: student.adm_no,
            name: `${student.first_name} ${student.surname}`,
            summary: formattedSummary,
        });

    } catch (error) {
        console.error("Error fetching student attendance summary:", error);
        res.status(500).json({ message: "Failed to fetch student attendance summary.", error: error.message });
    }
};


exports.getDailyAttendancePercentage = async (req, res) => {
    try {
        const schoolId = req.user.schoolObjectId; // schoolId from auth middleware

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for authenticated user." });
        }

        // Calculate the date 12 days ago from today (or the most recent record if data is sparse)
        const twelveDaysAgo = moment().subtract(12, 'days').startOf('day').toDate();

        const data = await AttendanceRecord.aggregate([
            {
                $match: {
                    schoolId: new mongoose.Types.ObjectId(schoolId),
                    // Only consider records from the last 12 days
                    // We will fetch more than 12 days and then sort and limit to get the *most recent* 12 distinct dates
                    attendanceDate: { $gte: twelveDaysAgo }
                }
            },
            // Step 1: Group by attendanceDate and status to count students
            {
                $group: {
                    _id: {
                        attendanceDate: "$attendanceDate",
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            // Step 2: Group by attendanceDate to pivot statuses and calculate total students
            {
                $group: {
                    _id: "$_id.attendanceDate",
                    totalStudents: { $sum: "$count" },
                    presentStudents: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.status", "Present"] }, "$count", 0]
                        }
                    }
                }
            },
            // Step 3: Project to calculate the present percentage
            {
                $project: {
                    _id: 0, // Exclude the default _id
                    attendanceDate: "$_id",
                    totalStudents: 1,
                    presentStudents: 1,
                    presentPercentage: {
                        $cond: {
                            if: { $gt: ["$totalStudents", 0] },
                            then: { $round: [{ $multiply: [{ $divide: ["$presentStudents", "$totalStudents"] }, 100] }, 2] },
                            else: 0
                        }
                    }
                }
            },
            // Step 4: Sort by attendanceDate descending to get most recent first
            {
                $sort: {
                    attendanceDate: -1 // Sort descending to easily pick the most recent 12
                }
            },
            // Step 5: Limit to the most recent 12 unique days
            {
                $limit: 12
            },
            // Step 6: Sort ascending again for the chart's x-axis
            {
                $sort: {
                    attendanceDate: 1
                }
            }
        ]);

        // Format dates and percentages for the frontend chart
        const dateLabels = data.map(item => moment(item.attendanceDate).format('YYYY-MM-DD'));
        const presentPercentages = data.map(item => item.presentPercentage);

        res.status(200).json({
            dateLabels,
            presentPercentages
        });

    } catch (error) {
        console.error("Error fetching daily attendance percentage:", error);
        res.status(500).json({ message: "Failed to fetch daily attendance percentage.", error: error.message });
    }
};