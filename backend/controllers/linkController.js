const supabase = require("../supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
