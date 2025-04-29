import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import adminRoutes from '../routes/adminRoutes'

const AdminLayout = () => {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader routes={adminRoutes} />
        <div className="body flex-grow-1">
          <AppContent routes={adminRoutes} />
        </div>
        <AppFooter />
      </div>
    </>
  )
}

export default AdminLayout