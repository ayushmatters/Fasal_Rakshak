import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SignupSection from './SignupSection'
import LanguageSelector from './LanguageSelector'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../app/AuthProvider'

const NavLink = ({ to, children }) => (
  <Link to={to} className="text-sm font-semibold text-gray-700 hover:text-accent px-3 py-2 rounded transition-colors">{children}</Link>
)

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 shadow-md backdrop-blur-sm" style={{ height: '80px' }}>
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <img src="/src/assets/roundlogo.png" alt="Fasal Rakshak" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-emerald-700 text-sm">Fasal</span>
            <span className="font-semibold text-emerald-700 text-sm">Rakshak</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center" aria-label="Main navigation">
          <NavLink to="/">{t('home')}</NavLink>
          <NavLink to="/scan">{t('scan')}</NavLink>
          <NavLink to="/dashboard">{t('dashboard')}</NavLink>
          <NavLink to="/community">{t('community')}</NavLink>
          <NavLink to="/products">{t('products')}</NavLink>
          <NavLink to="/contact">{t('contact')}</NavLink>
        </nav>

        {/* Right: Auth buttons + Language selector */}
        <div className="flex items-center gap-8 flex-shrink-0">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">{t('hello_user', { name: user?.name || 'User' })}</span>
              <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors" onClick={() => { logout(); navigate('/') }}>{t('logout')}</button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="px-8 py-2 rounded-lg border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors whitespace-nowrap">{t('sign_in')}</Link>
              <Link to="/signup" className="px-8 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition-colors whitespace-nowrap">{t('sign_up')}</Link>
            </div>
          )}

          {/* Language Selector - Always visible */}
          <LanguageSelector />

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="p-2 rounded transition-colors hover:bg-emerald-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (stacked) */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col p-4 gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">{t('home')}</Link>
            <Link to="/scan" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">{t('scan')}</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">{t('dashboard')}</Link>
            <Link to="/community" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">{t('community')}</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">{t('products')}</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700">{t('contact')}</Link>
            <div className="flex items-center gap-3 pt-2">
              <LanguageSelector />
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-md border border-emerald-600 text-emerald-700">{t('sign_in')}</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-md bg-emerald-600 text-white">{t('sign_up')}</Link>
            </div>
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

