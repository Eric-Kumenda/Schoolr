import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import studentRoutes from '../routes/studentRoutes'

const StudentLayout = () => {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader routes={studentRoutes} />
        <div className="body flex-grow-1">
          <AppContent routes={studentRoutes} />
        </div>
        <AppFooter />
      </div>
    </>
  )
}

export default StudentLayout