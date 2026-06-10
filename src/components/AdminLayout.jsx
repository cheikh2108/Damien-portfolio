import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: 'solar:home-2-linear', exact: true },
  { label: 'Projets', href: '/admin/projects', icon: 'solar:folder-linear' },
  { label: 'Carousel', href: '/admin/carousel', icon: 'solar:slider-horizontal-linear' },
  { label: 'Services', href: '/admin/services', icon: 'solar:tag-linear' },
  { label: 'Galerie', href: '/admin/gallery', icon: 'solar:gallery-linear' },
  { label: 'Profil', href: '/admin/profile', icon: 'solar:user-linear' },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  function isActive(item) {
    if (item.exact) return location.pathname === item.href
    return location.pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-neutral-900 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link to="/" className="text-xl font-light tracking-tight text-white">DAMIEN</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                isActive(item)
                  ? 'bg-white text-neutral-900'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <iconify-icon icon={item.icon} width="18" height="18" style={{ color: 'inherit' }}></iconify-icon>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <iconify-icon icon="solar:eye-linear" width="18" height="18"></iconify-icon>
            Voir le portfolio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <iconify-icon icon="solar:logout-3-linear" width="18" height="18"></iconify-icon>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-neutral-600">
            <iconify-icon icon="solar:hamburger-menu-linear" width="22" height="22"></iconify-icon>
          </button>
          <span className="text-sm font-semibold text-neutral-900">Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
