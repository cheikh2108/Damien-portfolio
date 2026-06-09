import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../components/Layout.jsx'
import { supabase } from '../lib/supabase.js'
import { fadeUp, scaleIn, stagger } from '../lib/animations.js'

const CATEGORIES = ['Tous', 'Identité Visuelle', 'Social Media', 'Graphisme', 'Retouche', 'Community']

const PLACEHOLDER_PROJECTS = [
  {
    id: 1,
    slug: 'refonte-identite-marque',
    title: 'Refonte d\'identité de marque',
    category: 'Identité Visuelle',
    date: 'Mai 2025',
    description: 'Direction artistique, charte graphique et déclinaisons pour les réseaux sociaux.',
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a96798fa-9905-42b3-9d61-fec4d29fbe06_800w.jpg',
    featured: true,
  },
  {
    id: 2,
    slug: 'campagne-instagram-lancement',
    title: 'Campagne Instagram — Lancement produit',
    category: 'Social Media',
    date: 'Avril 2025',
    description: 'Création de visuels, stories et reels pour un lancement de produit.',
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/361b93b3-4faa-4d90-a64d-f5de4921a4d7_800w.jpg',
    featured: false,
  },
  {
    id: 3,
    slug: 'affiches-evenementielles',
    title: 'Affiches événementielles',
    category: 'Graphisme',
    date: 'Mars 2025',
    description: 'Affiches et supports print pour une série d\'événements culturels.',
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/cee814f4-9f14-4c82-896a-b36587194633_800w.jpg',
    featured: false,
  },
  {
    id: 4,
    slug: 'strategie-contenu-brand-x',
    title: 'Stratégie de contenu — Brand X',
    category: 'Community',
    date: 'Février 2025',
    description: 'Planning éditorial, création de contenu et animation de communauté.',
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/88cc054f-a996-4a0c-8fec-3721e3ac4e25_800w.jpg',
    featured: false,
  },
  {
    id: 5,
    slug: 'retouches-montages-photoshop',
    title: 'Retouches & montages Photoshop',
    category: 'Retouche',
    date: 'Janvier 2025',
    description: 'Retouche photo avancée et compositions créatives pour clients e-commerce.',
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/779c923e-bcc8-49c7-9328-661a04d3f208_800w.jpg',
    featured: false,
  },
  {
    id: 6,
    slug: 'branding-startup',
    title: 'Branding startup tech',
    category: 'Identité Visuelle',
    date: 'Décembre 2024',
    description: 'Création complète de l\'identité visuelle d\'une startup en phase de lancement.',
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4f995362-9751-4d89-86fa-a5f7c03be905_1600w.jpg',
    featured: false,
  },
]

export default function Projects() {
  const [projects, setProjects] = useState(PLACEHOLDER_PROJECTS)
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchProjects() {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') return
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) setProjects(data)
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filtered = activeCategory === 'Tous'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  return (
    <Layout>
      <main className="max-w-7xl sm:px-6 mr-auto ml-auto pr-4 pb-8 pl-4">
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={stagger(0.1)} className="bg-white rounded-3xl mt-8 pt-8 pr-8 pb-8 pl-8">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="text-xs font-medium text-neutral-400 hover:text-neutral-600 transition uppercase tracking-wide">Accueil</Link>
            <iconify-icon icon="solar:alt-arrow-right-linear" width="12" height="12" className="text-neutral-300"></iconify-icon>
            <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Projets</span>
          </div>

          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">/Projects</p>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-neutral-900">Tous les projets.</h1>
              <p className="mt-4 text-neutral-600 max-w-xl">Explorez l'ensemble de mes réalisations — identités visuelles, contenus sociaux, graphisme et retouches photo.</p>
            </div>
            <div className="shrink-0">
              <span className="text-7xl md:text-8xl font-light text-neutral-100 tabular-nums">{String(filtered.length).padStart(2, '0')}</span>
            </div>
          </motion.div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" animate="show" variants={stagger(0.07)}
          >
            {filtered.map((project, index) => (
              <motion.div
                key={project.id}
                variants={fadeUp}
                className={project.featured && index === 0 ? 'md:col-span-2' : ''}
              >
              <Link
                to={`/projects/${project.slug}`}
                className="group block rounded-3xl p-1 ring-1 bg-neutral-50 ring-neutral-200 hover:ring-neutral-400 transition h-full"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={project.cover_url}
                    alt={project.title}
                    className={`w-full object-cover group-hover:scale-105 transition duration-500 ${
                      project.featured && index === 0 ? 'h-[380px]' : 'h-[260px]'
                    }`}
                    loading="lazy"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur">
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      Featured
                    </span>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0">
                    <div className="h-24 bg-gradient-to-t from-neutral-900/60 to-transparent"></div>
                  </div>
                </div>
                <div className="px-4 pt-4 pb-5">
                  <p className="text-xs font-medium text-neutral-500">{project.date}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-600 transition">{project.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{project.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-neutral-600 transition">
                    Voir le projet
                    <iconify-icon icon="solar:arrow-right-up-linear" width="14" height="14"></iconify-icon>
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </Layout>
  )
}
