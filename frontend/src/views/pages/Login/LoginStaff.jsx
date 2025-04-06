import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginStaff = () => {
    const navigate = useNavigate(); // Hook to navigate

	const [usernameValue, setUsernameValue] = useState("");
	const [passwordValue, setPasswordValue] = useState("");
	const [passwordView, setPasswordView] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		setTimeout(() => {
			// Simulate successful login
			//alert("Logged in:" + usernameValue + " " + passwordValue);
            navigate("/dashboard");
		}, 3000);
	};
	return (
		<>
			<div className="container">
				<div className="row d-flex justify-content-center min-vh-100">
					<div className="col col-sm-10 col-md-8 col-lg-5 col-xl-5 col-xxl-3 d-flex justify-content-center flex-column">
						<div className="col-12 mb-3">
							<Link to='/'><img
								src="/img/S_logo.png"
								className="rounded mx-auto d-block img-fluid"
								style={{ maxHeight: "80px" }}
								alt="Schoolr Logo"
							/></Link>
						</div>
						<h5 className="fw-bold mx-auto text-body font-fredoka">
							Staff Login
						</h5>
						<form className="px-3 px-md-1" onSubmit={handleSubmit}>
							<div className="mb-3">
								<label
									htmlFor="usernameField"
									className="form-label">
									Email
								</label>
								<input
									type="email"
									className="form-control"
									id="usernameField"
									placeholder="name@example.com"
									value={usernameValue}
									onChange={(e) =>
										setUsernameValue(e.target.value)
									}
									required
								/>
							</div>
							<div className="mb-3">
								<label
									htmlFor="passwordField"
									className="form-label">
									Password
								</label>
								<div className="input-group">
									<input
										type={
											passwordView ? "text" : "password"
										}
										id="passwordField"
										className="form-control"
										placeholder="******"
										aria-label="Password"
										aria-describedby="passBtn"
										value={passwordValue}
										onChange={(e) =>
											setPasswordValue(e.target.value)
										}
										required
									/>
									<button
										className="btn btn-outline-bg"
										type="button"
										id="passBtn"
										onClick={() =>
											setPasswordView(!passwordView)
										}>
										{passwordView ? (
											<i className="bi bi-eye"></i>
										) : (
											<i className="bi bi-eye-slash"></i>
										)}
									</button>
								</div>
							</div>

							<div className="col-12">
								<button
									className="btn btn-primary w-100 py-2"
									type="submit">
									Login
								</button>
							</div>
							<div className="mb-2 mt-3">
								<p className="text-center">
									Forgot Your Password?{" "}
									<Link
										to="/404"
										className="text-decoration-none">
										Reset Password
									</Link>
								</p>
							</div>
							<div className="my-2">
								<p className="text-center">
									New User?{" "}
									<Link
										to="/registerStaff"
										className="text-decoration-none">
										Request for your ID
									</Link>
								</p>
							</div>
							{/* <div className="my-2">
                                <p className="text-center text-muted fs-sm">@2025 Schoolr<br />All Rights Reserved.</p>
                            </div> */}
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default LoginStaff;
