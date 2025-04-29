import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import parentRoutes from '../routes/parentRoutes'

const ParentLayout = () => {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader routes={parentRoutes} />
        <div className="body flex-grow-1">
          <AppContent routes={parentRoutes} />
        </div>
        <AppFooter />
      </div>
    </>
  )
}

export default ParentLayout