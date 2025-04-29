require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const connectDB = require("./config/db");

require("./controllers/authController"); // where passport config lives

const app = express();
const port = 5000;
connectDB();

// CORS Configuration
const corsOptions = {
	origin: "http://localhost:5173", // Allow your frontend's origin
	methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
	credentials: true, // Allow credentials (cookies, HTTP auth headers, etc.)
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(passport.initialize());

const authRoutes = require("./routes/authRoutes");
const schoolRoutes = require("./routes/schoolRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/students", require("./routes/studentRoutes"));

// Start server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
