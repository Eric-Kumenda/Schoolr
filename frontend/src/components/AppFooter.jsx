import React from 'react'
import { CFooter } from '@coreui/react'
import { Link } from 'react-router-dom'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <Link to="/" target="_blank" rel="noopener noreferrer">
          Schoolr
        </Link>
        <span className="ms-1">&copy; 2025 Schoolr.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://getbootstrap.com" target="_blank" rel="noopener noreferrer">
          Bootstrap UI
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)