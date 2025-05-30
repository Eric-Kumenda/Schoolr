const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient"); // Adjust the path to your Supabase client
const { School } = require("../models/newSchoolModel");

const requireAdmin = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ msg: "No token provided" }); // Unauthorized
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Verify user existence and role in the database
		const { data: user, error } = await supabase
			.from("users")
			.select("role, schoolId, id")
			.eq("id", decoded.id)
			.single();

		if (error || !user) {
			return res
				.status(403)
				.json({ msg: "Invalid token or user not found" }); // Forbidden
		}

		if (user.role !== "admin") {
			return res.status(403).json({ msg: "Admin role required" }); // Forbidden
		}

		const school = await School.findOne({ schoolId: user.schoolId });
		if (!school) {
			return res.status(404).json({ message: "School not found." });
		}
		const schoolObjectId = school._id;

		// Attach user information to the request object for further use
		req.user = {
			id: user.id,
			role: user.role,
			schoolId: user.schoolId,
			schoolObjectId: schoolObjectId,
		};

		next(); // Proceed to the next middleware or route handler
	} catch (err) {
		console.error("Error verifying token:", err);
		return res.status(403).json({ msg: "Invalid token" }); // Forbidden
	}
};

module.exports = requireAdmin;
