import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [location])

  function goToSection(hash) {
    setIsMobileMenuOpen(false)
    if (location.pathname === '/') {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + hash)
    }
  }

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-40"
        style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 40 }}
      >
        <div
          className="max-w-7xl sm:px-6 mr-auto ml-auto pr-4 pl-4"
          style={{ paddingTop: '8px', paddingBottom: '8px' }}
        >
          <div className="flex bg-neutral-900 rounded-3xl pt-4 pr-8 pb-4 pl-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-lg font-semibold text-white tracking-tight">Damien</Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`transition text-sm font-medium ${location.pathname === '/' && !location.hash ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              >Work</Link>
              <Link
                to="/projects"
                className={`transition text-sm font-medium ${location.pathname.startsWith('/projects') ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              >Projects</Link>
              <button
                onClick={() => goToSection('#about')}
                className="text-sm font-medium transition text-neutral-400 hover:text-white"
              >About</button>
              <button
                onClick={() => goToSection('#contact')}
                className="text-sm font-medium transition text-neutral-400 hover:text-white"
              >Contact</button>
            </nav>
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border transition border-neutral-700 hover:bg-neutral-800 text-white"
              aria-label="Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <iconify-icon icon="solar:hamburger-menu-linear" width="20" height="20"></iconify-icon>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden bg-neutral-900 rounded-3xl mt-1 py-4 px-8 space-y-3">
              <Link to="/" className="block text-sm font-medium text-neutral-400 hover:text-white transition" onClick={() => setIsMobileMenuOpen(false)}>Work</Link>
              <Link to="/projects" className="block text-sm font-medium text-neutral-400 hover:text-white transition" onClick={() => setIsMobileMenuOpen(false)}>Projects</Link>
              <button onClick={() => goToSection('#about')} className="block w-full text-left text-sm font-medium text-neutral-400 hover:text-white transition">About</button>
              <button onClick={() => goToSection('#contact')} className="block w-full text-left text-sm font-medium text-neutral-400 hover:text-white transition">Contact</button>
            </div>
          )}
        </div>
      </header>

      {children}
    </div>
  )
}
