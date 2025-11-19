import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const NavLink = ({ to, children }) => (
  <Link to={to} className="text-sm text-text-muted hover:text-accent px-3 py-2 rounded transition-colors">{children}</Link>
)

const Navbar = () => {
  const [open, setOpen] = useState(false)
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

        <div className="md:hidden">
          <button 
            aria-label="Toggle menu" 
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)} 
            className="p-2 rounded transition-colors hover:bg-accent hover:bg-opacity-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden" role="navigation" aria-label="Mobile navigation">
          <div className="flex flex-col p-3">
            <Link to="/" onClick={() => setOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Home</Link>
            <Link to="/scan" onClick={() => setOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Scan Crop</Link>
            <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Dashboard</Link>
            <Link to="/community" onClick={() => setOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Community</Link>
            <Link to="/products" onClick={() => setOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Agri Products</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2 text-text-muted hover:text-accent transition-colors">Contact</Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar

