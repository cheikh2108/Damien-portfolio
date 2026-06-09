import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../components/Layout.jsx'
import { supabase } from '../lib/supabase.js'
import { fadeUp, fadeLeft, scaleIn, stagger } from '../lib/animations.js'

const PLACEHOLDER_PROJECTS = {
  'refonte-identite-marque': {
    id: 1,
    slug: 'refonte-identite-marque',
    title: 'Refonte d\'identité de marque',
    category: 'Identité Visuelle',
    date: 'Mai 2025',
    client: 'Client confidentiel',
    tools: ['Adobe Illustrator', 'Photoshop', 'Figma'],
    description: 'Direction artistique complète pour la refonte d\'une identité de marque existante. L\'objectif était de moderniser l\'image tout en conservant les valeurs fondamentales de la marque.',
    content: 'Ce projet a impliqué une analyse approfondie de l\'identité existante, une phase de recherche créative, et la création d\'un nouveau système visuel cohérent. Nous avons repensé le logo, la palette de couleurs, la typographie et toutes les déclinaisons pour les supports digitaux et print.\n\nLa nouvelle identité a été déclinée sur les réseaux sociaux, les supports print et le site web, avec une charte graphique complète pour assurer la cohérence visuelle sur tous les canaux.',
    images: [
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a96798fa-9905-42b3-9d61-fec4d29fbe06_800w.jpg',
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4f995362-9751-4d89-86fa-a5f7c03be905_1600w.jpg',
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a8f75e15-5f15-4877-a253-da0b8f89efee_1600w.jpg',
    ],
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a96798fa-9905-42b3-9d61-fec4d29fbe06_800w.jpg',
  },
  'campagne-instagram-lancement': {
    id: 2,
    slug: 'campagne-instagram-lancement',
    title: 'Campagne Instagram — Lancement produit',
    category: 'Social Media',
    date: 'Avril 2025',
    client: 'Brand startup',
    tools: ['Photoshop', 'Illustrator', 'Premiere Pro'],
    description: 'Création de visuels, stories et reels pour le lancement d\'un nouveau produit sur Instagram.',
    content: 'Mise en place d\'une campagne complète incluant posts statiques, stories animées et reels. Chaque visuel a été pensé pour maximiser l\'engagement et la conversion, avec un storytelling cohérent sur l\'ensemble de la campagne.\n\nLa campagne a généré une augmentation significative de l\'engagement et a contribué à un lancement produit réussi.',
    images: [
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/361b93b3-4faa-4d90-a64d-f5de4921a4d7_800w.jpg',
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/cee814f4-9f14-4c82-896a-b36587194633_800w.jpg',
    ],
    cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/361b93b3-4faa-4d90-a64d-f5de4921a4d7_800w.jpg',
  },
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightboxImg, setLightboxImg] = useState(null)

  useEffect(() => {
    async function fetchProject() {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url') {
        const p = PLACEHOLDER_PROJECTS[slug]
        setProject(p || null)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()
      if (!error && data) {
        setProject(data)
      } else {
        setProject(PLACEHOLDER_PROJECTS[slug] || null)
      }
      setLoading(false)
    }
    fetchProject()
  }, [slug])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-neutral-600">Projet introuvable.</p>
          <Link to="/projects" className="text-sm font-medium text-neutral-900 underline">← Retour aux projets</Link>
        </div>
      </Layout>
    )
  }

  const images = Array.isArray(project.images) ? project.images : [project.cover_url]
  const tools = Array.isArray(project.tools) ? project.tools : []

  return (
    <Layout>
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white">
            <iconify-icon icon="solar:close-circle-linear" width="32" height="32"></iconify-icon>
          </button>
          <img
            src={lightboxImg}
            alt="Aperçu"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <main className="max-w-7xl sm:px-6 mr-auto ml-auto pr-4 pb-8 pl-4">
        {/* Breadcrumb */}
        <div className="mt-6 flex items-center gap-2">
          <Link to="/" className="text-xs font-medium text-neutral-400 hover:text-neutral-600 transition uppercase tracking-wide">Accueil</Link>
          <iconify-icon icon="solar:alt-arrow-right-linear" width="12" height="12" className="text-neutral-300"></iconify-icon>
          <Link to="/projects" className="text-xs font-medium text-neutral-400 hover:text-neutral-600 transition uppercase tracking-wide">Projets</Link>
          <iconify-icon icon="solar:alt-arrow-right-linear" width="12" height="12" className="text-neutral-300"></iconify-icon>
          <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* Hero */}
        <motion.div initial="hidden" animate="show" variants={stagger(0.1)} className="mt-4 bg-white rounded-3xl overflow-hidden">
          <motion.div variants={scaleIn} className="relative">
            <img
              src={project.cover_url}
              alt={project.title}
              className="w-full h-[400px] md:h-[560px] object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <div className="h-48 bg-gradient-to-t from-white to-transparent"></div>
            </div>
            <div className="absolute right-4 top-4 flex gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur">
                {project.category}
              </span>
            </div>
          </motion.div>

          <div className="pt-6 pr-8 pb-8 pl-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: title + content */}
              <motion.div variants={fadeLeft} className="lg:col-span-8">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Projet</p>
                <h1 className="mt-2 text-4xl md:text-6xl font-light tracking-tight text-neutral-900">{project.title}</h1>
                <p className="mt-6 text-lg text-neutral-600 leading-relaxed">{project.description}</p>

                {project.content && (
                  <div className="mt-6 space-y-4">
                    {project.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-neutral-600 leading-relaxed">{para}</p>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Right: meta */}
              <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-4">
                <div className="ring-1 ring-neutral-200 rounded-3xl p-6 bg-neutral-50">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-sm font-medium text-neutral-900">{project.date}</p>
                    </div>
                    {project.client && (
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Client</p>
                        <p className="text-sm font-medium text-neutral-900">{project.client}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Catégorie</p>
                      <p className="text-sm font-medium text-neutral-900">{project.category}</p>
                    </div>
                    {tools.length > 0 && (
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Outils</p>
                        <div className="flex flex-wrap gap-2">
                          {tools.map(tool => (
                            <span key={tool} className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700">{tool}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to="/projects"
                  className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 ring-1 transition bg-neutral-900 ring-neutral-900 hover:bg-black text-white text-sm font-medium"
                >
                  <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
                  Retour aux projets
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Gallery */}
        {images.length > 1 && (
          <section className="mt-4 bg-white rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Galerie du projet</p>
              <span className="text-xs font-medium text-neutral-500">{images.length} visuels</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxImg(img)}
                  className={`group relative overflow-hidden rounded-2xl ring-1 ring-neutral-200 hover:ring-neutral-400 transition ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <img
                    src={img}
                    alt={`${project.title} — visuel ${index + 1}`}
                    className={`w-full object-cover group-hover:scale-105 transition duration-500 ${
                      index === 0 ? 'h-[400px]' : 'h-[220px]'
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300 flex items-center justify-center">
                    <iconify-icon icon="solar:magnifer-zoom-in-linear" width="28" height="28" className="text-white opacity-0 group-hover:opacity-100 transition"></iconify-icon>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Next project CTA */}
        <div className="mt-4 bg-neutral-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1">Vous avez aimé ce projet ?</p>
            <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight">Explorez d'autres réalisations</h3>
          </div>
          <Link
            to="/projects"
            className="shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition"
          >
            Voir tous les projets
            <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16"></iconify-icon>
          </Link>
        </div>
      </main>
    </Layout>
  )
}
