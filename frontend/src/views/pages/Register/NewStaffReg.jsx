import React, { useState } from "react";
import LoaderModal from "../../../components/LoaderModal/LoaderModal";
import { Link } from "react-router-dom";

const NewStaffReg = () => {
	const [loading, setLoading] = useState(false);

	const [firstNameValue, setFirstNameValue] = useState("");
	const [lastNameValue, setLastNameValue] = useState("");
	const [IdValue, setIdValue] = useState("");
	const [schoolValue, setSchoolValue] = useState("");
	const [telValue, setTelValue] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		//Loader Animation
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			// Simulate successful login
			alert("Logged in:" + IdValue + " " + schoolValue);
		}, 3000);
	};
	return (
		<>
			<div className="container">
				<div className="row d-flex justify-content-center min-vh-100">
					<div className="col col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-3 d-flex justify-content-center flex-column">
						<div className="col-12 mb-3">
							<Link to="/">
								<img
									src="/img/S_logo.png"
									className="rounded mx-auto d-block img-fluid"
									style={{ maxHeight: "80px" }}
									alt="Schoolr Logo"
								/>
							</Link>
						</div>
						<h5 className="fw-bold mx-auto text-body font-fredoka">
							New Staff?
						</h5>
						<form className="px-3 px-md-1" onSubmit={handleSubmit}>
							<div className="mb-3 row">
								<div className="col">
									<label
										htmlFor="firstNameField"
										className="form-label">
										First Name
									</label>
									<input
										type="text"
										className="form-control"
										id="firstNameField"
										placeholder="Your First Name"
										value={firstNameValue}
										onChange={(e) =>
											setFirstNameValue(e.target.value)
										}
										required
									/>
								</div>
								<div className="col">
									<label
										htmlFor="lastNameField"
										className="form-label">
										Last Name
									</label>
									<input
										type="text"
										className="form-control"
										id="lastNameField"
										placeholder="Your Last Name"
										value={lastNameValue}
										onChange={(e) =>
											setLastNameValue(e.target.value)
										}
										required
									/>
								</div>
							</div>

							<div className="mb-3">
								<label
									htmlFor="admField"
									className="form-label">
									National ID/ Passport Number
								</label>
								<input
									type="text"
									className="form-control"
									id="admField"
									placeholder="ID No."
									value={IdValue}
									onChange={(e) => setIdValue(e.target.value)}
									required
								/>
							</div>

							<div className="mb-3">
								<label
									htmlFor="schoolField"
									className="form-label">
									School
								</label>
								<select
									className="form-select"
									id="schoolField"
									aria-label="Select Your School"
									value={schoolValue}
									onChange={(e) =>
										setSchoolValue(e.target.value)
									}
									required>
									<option value="1">
										Alliance High School
									</option>
									<option value="2">Nairobi School</option>
									<option value="3">Kenya High School</option>
								</select>
							</div>

							<div className="mb-3">
								<label
									htmlFor="telField"
									className="form-label">
									Phone Number
								</label>
								<div className="input-group">
									<span className="input-group-text">
										+254 🇰🇪
									</span>
									<input
										type="text"
										className="form-control"
										id="telField"
										placeholder="XXX XXX XXX"
										value={telValue}
										onChange={(e) =>
											setTelValue(e.target.value)
										}
										required
									/>
								</div>
							</div>

							<div className="col-12">
								<button
									className="btn btn-primary w-100 py-2"
									type="submit">
									Request ID and Password
								</button>
							</div>
							<div className="mb-2 mt-3">
								<p className="text-center">
									Already Registered?{" "}
									<Link
										to="/auth/login"
										className="text-decoration-none">
										Sign In
									</Link>
								</p>
							</div>
							{/* <div className="my-2">
                                <p className="text-center text-muted fs-sm">@2025 Schoolr<br />All Rights Reserved.</p>
                            </div> */}
						</form>
					</div>
				</div>
				{/* Loader Modal */}
				<LoaderModal isLoading={loading} />
			</div>
		</>
	);
};

export default NewStaffReg;
