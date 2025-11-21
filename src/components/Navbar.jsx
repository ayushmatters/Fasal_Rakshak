import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SignupSection from './SignupSection'
import { useAuth } from '../app/AuthProvider'

const NavLink = ({ to, children }) => (
  <Link to={to} className="text-sm text-text-muted hover:text-accent px-3 py-2 rounded transition-colors">{children}</Link>
)

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header>
      <div className="app-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src="/src/assets/logo.svg" alt="Fasal Rakshak" className="w-8 h-8" />
            <span className="font-semibold text-accent">Fasal Rakshak</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/scan">Scan Crop</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/products">Agri Products</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Hello, <strong className="text-accent">{user?.name || 'User'}</strong></span>
              <button className="px-3 py-2 bg-secondary text-white rounded" onClick={() => { logout(); navigate('/') }}>Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="inline-block px-4 py-2 bg-transparent border border-primary text-primary rounded-md hover:bg-primary/5">Sign In</Link>
              <Link to="/signup" className="inline-block px-4 py-2 bg-primary text-white rounded-md shadow hover:opacity-95">Sign Up</Link>
            </div>
          )}
          <div className="md:hidden">
           <button 
             aria-label="Toggle menu" 
             aria-expanded={menuOpen}
             onClick={() => setMenuOpen((v) => !v)} 
            className="p-2 rounded transition-colors hover:bg-accent hover:bg-opacity-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" role="navigation" aria-label="Mobile navigation">
          <div className="flex flex-col p-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Home</Link>
            <Link to="/scan" onClick={() => setMenuOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Scan Crop</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Dashboard</Link>
            <Link to="/community" onClick={() => setMenuOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Community</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Agri Products</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Contact</Link>
            <button onClick={() => { setMenuOpen(false); setSignupOpen(true) }} className="mt-2 px-4 py-2 bg-primary text-white rounded">Sign Up</button>
          </div>
        </div>
      )}

      {/* Signup drawer/modal (right side). Re-uses `open` state to show. */}
      {signupOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSignupOpen(false)} aria-hidden />
          <aside className="ml-auto w-full sm:w-96 h-full bg-white shadow-xl p-4 overflow-auto">
            <div className="flex justify-end">
              <button aria-label="Close signup" onClick={() => setSignupOpen(false)} className="p-2 rounded hover:bg-gray-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="mt-2">
              <SignupSection />
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}

export default Navbar

