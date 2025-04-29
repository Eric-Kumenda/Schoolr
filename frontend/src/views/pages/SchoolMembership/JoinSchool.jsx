import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axios";

const JoinSchool = () => {
	const [formData, setFormData] = useState({
		schoolId: "",
		role: "student",
		proofUrl: "",
	});
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post("/join-requests", formData, {
				withCredentials: true,
			});
			alert("Join request sent! Please wait for admin approval.");
			navigate("/pending-verification");
		} catch (err) {
			console.error(err);
			alert("Failed to submit join request");
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Join a School</h2>
			<input
				type="text"
				placeholder="School ID"
				value={formData.schoolId}
				onChange={(e) =>
					setFormData({ ...formData, schoolId: e.target.value })
				}
			/>
			<select
				value={formData.role}
				onChange={(e) =>
					setFormData({ ...formData, role: e.target.value })
				}>
				<option value="student">Student</option>
				<option value="teacher">Teacher</option>
				<option value="parent">Parent</option>
			</select>
			<input
				type="text"
				placeholder="Proof (Optional URL)"
				value={formData.proofUrl}
				onChange={(e) =>
					setFormData({ ...formData, proofUrl: e.target.value })
				}
			/>
			<button type="submit">Submit Request</button>
		</form>
	);
};

export default JoinSchool;
