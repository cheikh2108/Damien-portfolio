import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout.jsx'
import { supabase } from '../../lib/supabase.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, gallery: 0 })
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email)

      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url'
      if (isConfigured) {
        const [{ count: pCount }, { count: gCount }] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
        ])
        setStats({ projects: pCount || 0, gallery: gCount || 0 })
      }
      setLoading(false)
    }
    load()
  }, [])

  const QUICK_ACTIONS = [
    { label: 'Nouveau projet', href: '/admin/projects', icon: 'solar:add-square-linear', desc: 'Ajouter un projet au portfolio' },
    { label: 'Modifier le carousel', href: '/admin/carousel', icon: 'solar:slider-horizontal-linear', desc: 'Images de la page accueil' },
    { label: 'Modifier les services', href: '/admin/services', icon: 'solar:tag-linear', desc: 'Offres et tarifs' },
    { label: 'Modifier le profil', href: '/admin/profile', icon: 'solar:user-linear', desc: 'Bio, outils, réseaux sociaux' },
    { label: 'Galerie', href: '/admin/gallery', icon: 'solar:gallery-linear', desc: 'Gérer les visuels de la galerie' },
    { label: 'Voir le portfolio', href: '/', icon: 'solar:eye-linear', desc: 'Voir la version publique' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-neutral-900 rounded-3xl p-6 md:p-8">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">/Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white">Bonjour, Damien 👋</h1>
          {userEmail && <p className="mt-1 text-sm text-white/60">{userEmail}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Projets', value: loading ? '—' : stats.projects, icon: 'solar:folder-linear', href: '/admin/projects' },
            { label: 'Galerie', value: loading ? '—' : stats.gallery, icon: 'solar:gallery-linear', href: '/admin/gallery' },
            { label: 'Portfolio', value: 'Live', icon: 'solar:globe-linear', href: '/' },
            { label: 'Status', value: 'Actif', icon: 'solar:check-circle-linear', href: null },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-3xl p-5 ring-1 ring-neutral-200 shadow-sm ${stat.href ? 'hover:ring-neutral-400 transition' : ''}`}>
              {stat.href ? (
                <Link to={stat.href} className="block">
                  <StatCard {...stat} />
                </Link>
              ) : (
                <StatCard {...stat} />
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-3xl p-6 ring-1 ring-neutral-200 shadow-sm">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">/Actions rapides</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:grid-cols-3">
            {QUICK_ACTIONS.map(action => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center gap-4 p-4 rounded-2xl ring-1 ring-neutral-200 hover:bg-neutral-50 hover:ring-neutral-400 transition"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900">
                  <iconify-icon icon={action.icon} width="18" height="18" style={{ color: 'white' }}></iconify-icon>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{action.label}</p>
                  <p className="text-xs text-neutral-500">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Supabase si pas configuré */}
        {(!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') && (
          <div className="bg-amber-50 rounded-3xl p-6 ring-1 ring-amber-200">
            <div className="flex items-start gap-3">
              <iconify-icon icon="solar:info-circle-linear" width="20" height="20" className="text-amber-600 shrink-0 mt-0.5"></iconify-icon>
              <div>
                <p className="text-sm font-semibold text-amber-900">Supabase non configuré</p>
                <p className="mt-1 text-sm text-amber-700">
                  Créez votre projet Supabase et renseignez les variables dans <code className="bg-amber-100 px-1 rounded">.env.local</code> pour activer la base de données.
                </p>
                <div className="mt-3 space-y-1 font-mono text-xs text-amber-700 bg-amber-100 rounded-xl p-3">
                  <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=eyJhbG...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
        <iconify-icon icon={icon} width="16" height="16" className="text-neutral-400"></iconify-icon>
      </div>
      <p className="text-3xl font-light tracking-tight text-neutral-900">{value}</p>
    </div>
  )
}
