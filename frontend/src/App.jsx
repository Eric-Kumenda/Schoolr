import React, {useEffect, Suspense} from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'

import "./scss/styles.scss";

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/Login/Login'))
const RegisterStaff = React.lazy(() => import('./views/pages/Register/NewStaffReg'))
const RegisterStudent = React.lazy(() => import('./views/pages/Register/NewStudent'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {

	const { isColorModeSet, setColorMode } = useColorModes('light') //useColorModes('coreui-free-react-admin-template-theme')
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
			  <CSpinner color="primary" variant="grow" />
			</div>
		  }
		>
		  <Routes>
			<Route exact path="/login" name="Login Page" element={<Login />} />
			<Route exact path="/registerStaff" name="Staff Register Page" element={<RegisterStaff />} />
			<Route exact path="/registerStudent" name="Student Register Page" element={<RegisterStudent />} />
			<Route exact path="/404" name="Page 404" element={<Page404 />} />
			<Route exact path="/500" name="Page 500" element={<Page500 />} />
			<Route path="*" name="Home" element={<DefaultLayout />} />
		  </Routes>
		</Suspense>
	  </HashRouter>
	);
};

export default App;
