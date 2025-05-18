const supabase = require("../supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

exports.register = async (req, res) => {
	const { first_name, last_name, email, password, role } = req.body;

	try {
		const { data: existingUser, error: fetchError } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.single();

		if (existingUser)
			return res.status(400).json({ msg: "Email already exists" });

		const hashedPassword = await bcrypt.hash(password, 10);

		const { error: insertError } = await supabase.from("users").insert([
			{
				first_name,
				email,
				password: hashedPassword,
				role,
				refreshToken: "",
				schoolId: "",
				isVerified: false,
				last_name,
			},
		]);

		if (insertError) throw insertError;

		res.status(201).json({ msg: "User account created successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: err.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.single();

		if (!user) return res.status(400).json({ msg: "Invalid credentials" });

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch)
			return res.status(400).json({ msg: "Invalid credentials" });

		const accessToken = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);
		const refreshToken = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: "7d" }
		);

		await supabase.from("users").update({ refreshToken }).eq("id", user.id);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			path: "/api/auth/refresh",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.json({
			token: accessToken,
			user: {
				id: user.id,
				first_name: user.first_name,
				last_name: user.last_name,
				role: user.role,
				schoolId: user.schoolId,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: err.message });
	}
};

exports.refresh = async (req, res) => {
	const token = req.cookies.refreshToken;
	if (!token) return res.sendStatus(401);

	try {
		const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", decoded.id)
			.single();

		if (!user || user.refreshToken !== token) {
			return res.sendStatus(403);
		}

		const newAccessToken = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);

		res.json({
			token: newAccessToken,
			user: {
				id: user.id,
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email,
				role: user.role,
				schoolId: user.schoolId,
			},
		});
	} catch (err) {
		console.error(err);
		res.sendStatus(403);
	}
};

exports.logout = async (req, res) => {
	const token = req.cookies.refreshToken;

	if (token) {
		// Find user with matching refreshToken
		const { data: user, error } = await supabase
			.from("users")
			.select("id")
			.eq("refreshToken", token)
			.single();

		if (user) {
			// Clear the refreshToken in database
			await supabase
				.from("users")
				.update({ refreshToken: "" })
				.eq("id", user.id);
		}
	}

	res.clearCookie("refreshToken", {
		path: "/api/auth/refresh",
		sameSite: "None",
		secure: true,
	});
	res.status(200).json({ message: "Logged out" });
};

exports.googleLogin = async (req, res) => {
	const { token } = req.body;

	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		const email = payload.email;
		const first_name = payload.first_name;
		const last_name = payload.last_name;
		const googleId = payload.sub;

		// Find user in Supabase
		const { data: existingUser, error } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.single();

		let userId;

		if (!existingUser) {
			// User does not exist, create
			const { data: newUser, error: insertError } = await supabase
				.from("users")
				.insert([
					{
						first_name,
						last_name,
						email,
						googleId,
						role: null,
						schoolId: null,
						isVerified: false,
					},
				])
				.select()
				.single();

			if (insertError) throw insertError;
			userId = newUser.id;
		} else {
			userId = existingUser.id;
		}

		const user =
			existingUser ||
			(await supabase.from("users").select("*").eq("id", userId).single())
				.data;

		const accessToken = jwt.sign(
			{ id: userId, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);
		const refreshToken = jwt.sign(
			{ id: userId, role: user.role },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: "7d" }
		);

		// Update user refreshToken
		await supabase.from("users").update({ refreshToken }).eq("id", userId);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			path: "/api/auth/refresh",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.json({
			token: accessToken,
			user: {
				id: userId,
				email: user.email,
				fname: user.first_name,
				lname: user.last_name,
				role: user.role,
				schoolId: user.schoolId,
			},
		});
	} catch (err) {
		console.error("Google login error:", err);
		res.status(401).json({ msg: "Invalid Google token" });
	}
};
