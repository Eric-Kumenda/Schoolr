import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import teacherRoutes from '../routes/teacherRoutes'

const TeacherLayout = () => {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader routes={teacherRoutes} />
        <div className="body flex-grow-1">
          <AppContent routes={teacherRoutes} />
        </div>
        <AppFooter />
      </div>
    </>
  )
}

export default TeacherLayout