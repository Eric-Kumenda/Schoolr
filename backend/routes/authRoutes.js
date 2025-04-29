const express = require("express");
const router = express.Router();

const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
	register,
	login,
	refresh,
	logout,
	googleLogin,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);
router.get("/logout", logout);
router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);
router.post('/google-login', googleLogin);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login",
		session: false,
	}),
	(req, res) => {
		const token = jwt.sign(
			{ id: req.user._id, role: req.user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);
		const refreshToken = jwt.sign(
			{ id: req.user._id, role: req.user.role },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: "7d" }
		);

		req.user.refreshToken = refreshToken;
		req.user.save();

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Strict",
			path: "/api/auth/refresh",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		// redirect to frontend with access token in query
		res.redirect(`http://localhost:5173/#/login?token=${token}`);
	}
);

module.exports = router;
