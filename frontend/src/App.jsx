import React, {useEffect, Suspense} from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'


// Import all of Bootstrap's JS
import "@coreui/coreui/dist/css/coreui.min.css";
//import "bootstrap/dist/css/bootstrap.min.css";
//import "@coreui/coreui/dist/js/bootstrap.bundle.min.js";
import "@coreui/coreui/dist/js/coreui.bundle.min.js";

import "core-js";

// Import our custom CSS
import "./scss/styles.scss";
import "./scss/custom.scss";
//import "./scss/customBootstrap.scss";

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const LoginStaff = React.lazy(() => import('./views/pages/Login/LoginStaff'))
const LoginStudent = React.lazy(() => import('./views/pages/Login/LoginStudent'))
const RegisterStaff = React.lazy(() => import('./views/pages/Register/NewStaffReg'))
const RegisterStudent = React.lazy(() => import('./views/pages/Register/NewStudent'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {

	const { isColorModeSet, setColorMode } = useColorModes("Schoolr")
	const storedTheme = useSelector((state) => state.theme)
  
	useEffect(() => {
	  const urlParams = new URLSearchParams(window.location.href.split('?')[1])
	  const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
	  if (theme) {
		setColorMode(theme)
	  }
  
	  if (isColorModeSet()) {
		return
	  }
  
	  setColorMode(storedTheme)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps
	return (
		<HashRouter>
		<Suspense
		  fallback={
			<div className="pt-3 text-center">
			  <CSpinner color="body" />
			</div>
		  }
		>
		  <Routes>
		  <Route exact path="/loginStaff" name="Staff Login Page" element={<LoginStaff />} />
		  <Route exact path="/loginStudent" name="Student Login Page" element={<LoginStudent />} />
			<Route exact path="/registerStaff" name="Staff Register Page" element={<RegisterStaff />} />
			<Route exact path="/registerStudent" name="Student Register Page" element={<RegisterStudent />} />
			<Route exact path="/404" name="Page 404" element={<Page404 />} />
			<Route exact path="/500" name="Page 500" element={<Page500 />} />
			<Route path="/*" name="Home" element={<DefaultLayout />} />
		  </Routes>
		</Suspense>
	  </HashRouter>
	);
};

export default App;
