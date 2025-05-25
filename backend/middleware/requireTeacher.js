// middleware/requireTeacher.js
const jwt = require("jsonwebtoken");
const { School } = require("../models/newSchoolModel");
const supabase = require("../supabaseClient");

const requireTeacher = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ msg: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const { data: user, error } = await supabase
			.from("users") // Your Supabase user table
			.select("role, schoolId, id")
			.eq("id", decoded.id)
			.single();

		if (error || !user) {
			return res
				.status(403)
				.json({ msg: "Invalid token or user not found." });
		}

		// Check if the user has 'teacher' role or is an admin (for higher privilege access)
		if (user.role !== "teacher" && user.role !== "admin") {
			return res
				.status(403)
				.json({ msg: "Teacher or Admin role required." });
		}

		const school = await School.findOne({ schoolId: user.schoolId });
		if (!school) {
			return res.status(404).json({ msg: "School not found" });
		}
		schoolObjectId = school._id;
		req.user = {
			id: user.id, // Supabase user ID
			role: user.role,
			schoolId: schoolObjectId, // Mongoose ObjectId of the school
		};

		next();
	} catch (err) {
		console.error("Error in requireTeacher middleware:", err);
		return res.status(403).json({ msg: "Invalid token." });
	}
};

module.exports = requireTeacher;
