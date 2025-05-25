const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Supabase user's Mongoose ID
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: '5m' }, // OTP expires in 5 minutes
    targetContact: { type: String, required: true }, // The email or phone number it was sent to
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }, // Link to school
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;