// src/components/Auth/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const {role} = useSelector((state) => state.auth)
    const loginState = useSelector(
      (state) =>
        state.auth.token !== null &&
        state.auth.email !== null &&
        state.auth.role !== null
    );
  //console.log(role)

  if (!loginState) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/404" replace />
  }

  return children
}

export default ProtectedRoute
