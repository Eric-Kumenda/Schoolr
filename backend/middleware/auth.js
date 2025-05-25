const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
	const token = req.headers["authorization"];
	if (!token) return res.status(401).json({ msg: "No token provided" });

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ msg: "Invalid token" });
	}
};

const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ msg: "Access denied" });
		}
		next();
	};
};

module.exports = { authMiddleware, authorizeRoles };
