import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { googleLoginUser, loadUser, loginUser } from "../../../store/authSlice";
import { getSchoolProfile } from "../../../store/schoolSlice";
import { fetchConversations } from "../../../store/chatSlice";
import BarLoader from "../../../components/loaders/BarLoader";
import { CSpinner } from "@coreui/react";
import { addToast } from "../../../store/toastSlice";

const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const loginLoading = useSelector((state) => state.auth.loading);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	const [passwordView, setPasswordView] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const result = await dispatch(loginUser(formData));
			const schoolResult = await dispatch(
				getSchoolProfile({ schoolId: result?.payload?.user?.schoolId })
			);
			//await dispatch(fetchConversations(result?.payload?.user?.userId));
			if (result?.payload?.token && schoolResult) {
				dispatch(
					addToast({
						id: Date.now(),
						message:
							"User " +
							result.payload.user.first_name +
							" Logged In",
						title: "Success",
						color: "#28a745",
						timestamp: Date.now(),
					})
				);
				switch (result.payload.user.role) {
					case "admin":
						navigate("/admin");
						break;
					case "teacher":
						navigate("/teacher");
						break;
					case "student":
						navigate("/student");
						break;
					case "parent":
						navigate("/parent");
						break;
					case "finance":
						navigate("/finance");
						break;
					default:
						navigate("/unauthorized");
				}
			} else {
				dispatch(
				addToast({
					id: Date.now(),
					message: "Server Unreachable",
					title: "Error",
					color: "#e55353",
					timestamp: Date.now(),
				})
			);
			}
		} catch (error) {
			dispatch(
				addToast({
					id: Date.now(),
					message: error,
					title: "Error",
					color: "#e55353",
					timestamp: Date.now(),
				})
			);
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const result = await dispatch(
				googleLoginUser(credentialResponse.credential)
			);

			if (result?.payload?.token) {
				dispatch(
					addToast({
						id: Date.now(),
						message:
							"User " +
							result.payload.user.first_name +
							" Logged In",
						title: "Success",
						color: "#28a745",
						timestamp: Date.now(),
					})
				);
				switch (result.payload.user.role) {
					case "admin":
						navigate("/admin");
						break;
					case "teacher":
						navigate("/teacher");
						break;
					case "student":
						navigate("/student");
						break;
					case "parent":
						navigate("/parent");
						break;
					default:
						navigate("/unauthorized");
				}
			}
		} catch (error) {
			dispatch(
				addToast({
					id: Date.now(),
					message: error,
					title: "Error",
					color: "#e55353",
					timestamp: Date.now(),
				})
			);
		}
	};
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");

		if (token) {
			const payload = JSON.parse(atob(token.split(".")[1]));
			dispatch(setUser({ ...payload, token }));
			localStorage.setItem("token", token);
			window.location.href = "/"; // redirect to dashboard
		}
	}, []);
	return (
		<>
			<div className="container">
				<div className="row d-flex justify-content-center min-vh-100">
					<div className="col col-sm-10 col-md-8 col-lg-5 col-xl-5 col-xxl-3 d-flex justify-content-center flex-column">
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
							Schoolr Login
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
									className="form-control bg-body"
									id="usernameField"
									name="email"
									placeholder="name@mail.com"
									onChange={handleChange}
									required
									autoComplete="email"
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
										className="form-control bg-body"
										name="password"
										placeholder="******"
										aria-label="Password"
										aria-describedby="passBtn"
										onChange={handleChange}
										required
										autoComplete="current-password"
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
									type={loginLoading ? "button" : "submit"}>
									{loginLoading ? (
										<CSpinner color="light" />
									) : (
										"Login"
									)}
								</button>
							</div>
							<hr />
							<p className="text-center text-muted my-1">OR</p>
							<div className="mb-2">
								<GoogleLogin
									onSuccess={handleGoogleSuccess}
									onError={() => console.log("Login Failed")}
									useOneTap
								/>
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
										to="/register"
										className="text-decoration-none">
										Create An Account
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

export default Login;
