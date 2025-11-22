import React from 'react'
import Navbar from './Navbar'

// Layout component: fixed navbar height is 80px -> apply pt-20 (Tailwind) to main
// Use `pt-20` so content starts below the fixed header; you can adjust to `pt-16` if using 64px header.
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20"> {/* Reserve space for fixed navbar (80px) */}
        <div className="app-container">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
