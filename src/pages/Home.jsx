import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UnicornScene from 'unicornstudio-react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout.jsx'
import { supabase } from '../lib/supabase.js'
import { fadeUp, fadeIn, fadeLeft, scaleIn, stagger, scrollFadeUp } from '../lib/animations.js'

// ---- Fallbacks ----
const DEFAULT_CAROUSEL = [
  { id: 1, src: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4f995362-9751-4d89-86fa-a5f7c03be905_1600w.jpg", alt: "Portrait minimal" },
  { id: 2, src: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a8f75e15-5f15-4877-a253-da0b8f89efee_1600w.jpg", alt: "Beige fashion editorial" },
  { id: 3, src: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a3001134-ae66-49be-8bea-f8eed8b7e07e_1600w.jpg", alt: "Moody mountains" },
  { id: 4, src: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bf79840-b7ed-4d8d-acd3-c5f5835a065e_800w.jpg", alt: "3D minimal render" },
]

const DEFAULT_PROFILE = {
  name: 'Damien', title: 'Community Manager & Graphiste Junior',
  bio_intro: 'Community Manager et Graphiste Junior passionné par la création de contenus visuels qui marquent les esprits.',
  bio_main: "Maîtrisant la suite Adobe (Photoshop, Illustrator, Premiere Pro) et les codes des réseaux sociaux, je crée des identités visuelles cohérentes, des contenus engageants et des campagnes qui résonnent avec les audiences cibles.",
  bio_extra: "Curieux et créatif, je touche à tout : du graphisme print au motion design, en passant par la gestion de communautés et la stratégie de contenu.",
  stat_1_value: '50+', stat_1_label: 'Projets réalisés',
  stat_2_value: '2+', stat_2_label: "Ans d'expérience",
  stat_3_value: '10+', stat_3_label: 'Marques accompagnées',
  tools: [
    { name: 'Photoshop', level: 'Maîtrisé' }, { name: 'Illustrator', level: 'Maîtrisé' },
    { name: 'Premiere Pro', level: 'Avancé' }, { name: 'Canva / Figma', level: 'Avancé' },
  ],
  specialties: ['Identité visuelle & branding', 'Contenus réseaux sociaux', 'Retouche & montage photo'],
  email: 'hello@damien.studio', phone: '',
  instagram_url: '#', behance_url: '#', linkedin_url: '#',
  testimonial_quote: "Travailler avec Damien, c'est allier créativité, réactivité et un sens aigu du détail visuel.",
  footer_tagline: 'Community Manager & Graphiste Junior',
}

const DEFAULT_SERVICES = [
  { id: 1, title: 'Pack Visuel', subtitle: 'Création de visuels pour vos réseaux sociaux', delivery: 'Livraison sous 48h', duration: '5 Visuels', price: 'Sur devis', popular: false, features: [{ text: 'Posts & stories', included: true }, { text: 'Formats adaptés', included: true }, { text: '1 révision incluse', included: true }, { text: 'Charte graphique', included: false }] },
  { id: 2, title: 'Identité Visuelle', subtitle: 'Création complète de votre identité de marque', delivery: 'Livraison sous 5 jours', duration: 'Complet', price: 'Sur devis', popular: true, features: [{ text: 'Logo & charte graphique', included: true }, { text: 'Palette de couleurs', included: true }, { text: 'Typographies', included: true }, { text: '3 révisions incluses', included: true }] },
  { id: 3, title: 'Community Management', subtitle: 'Gestion complète de vos réseaux sociaux', delivery: 'Sur mesure', duration: 'Mensuel', price: 'Sur devis', popular: false, features: [{ text: 'Planning éditorial', included: true }, { text: 'Création de contenu', included: true }, { text: 'Animation communauté', included: true }, { text: 'Reporting mensuel', included: true }] },
]

const DEFAULT_PROJECTS = [
  { id: 1, slug: 'refonte-identite-marque', title: "Refonte d'identité de marque", category: 'Identité Visuelle', date: 'Mai 2025', description: 'Direction artistique, charte graphique et déclinaisons pour les réseaux sociaux.', cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a96798fa-9905-42b3-9d61-fec4d29fbe06_800w.jpg', featured: true },
  { id: 2, slug: 'campagne-instagram-lancement', title: 'Campagne Instagram — Lancement produit', category: 'Social Media', date: 'Avril 2025', description: 'Création de visuels, stories et reels pour un lancement de produit.', cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/361b93b3-4faa-4d90-a64d-f5de4921a4d7_800w.jpg' },
  { id: 3, slug: 'affiches-evenementielles', title: 'Affiches événementielles', category: 'Graphisme', date: 'Mars 2025', description: "Affiches et supports print pour une série d'événements culturels.", cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/cee814f4-9f14-4c82-896a-b36587194633_800w.jpg' },
  { id: 4, slug: 'strategie-contenu-brand-x', title: 'Stratégie de contenu — Brand X', category: 'Community', date: 'Février 2025', description: 'Planning éditorial, création de contenu et animation de communauté.', cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/88cc054f-a996-4a0c-8fec-3721e3ac4e25_800w.jpg' },
  { id: 5, slug: 'retouches-montages-photoshop', title: 'Retouches & montages Photoshop', category: 'Retouche', date: 'Janvier 2025', description: 'Retouche photo avancée et compositions créatives pour clients e-commerce.', cover_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/779c923e-bcc8-49c7-9328-661a04d3f208_800w.jpg' },
]

// Composant section animée au scroll
function ScrollSection({ children, className, id }) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={scrollFadeUp}
    >
      {children}
    </motion.section>
  )
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [carouselImages, setCarouselImages] = useState(DEFAULT_CAROUSEL)
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState(DEFAULT_SERVICES)
  const [projects, setProjects] = useState(DEFAULT_PROJECTS)
  const [galleryItems, setGalleryItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [
        { data: carouselData },
        { data: profileData },
        { data: servicesData },
        { data: projectsData },
        { data: galleryData },
      ] = await Promise.all([
        supabase.from('carousel_images').select('*').order('sort_order'),
        supabase.from('profile').select('*').eq('id', 1).single(),
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('gallery_items').select('*').order('created_at', { ascending: false }).limit(9),
      ])
      if (carouselData && carouselData.length > 0) setCarouselImages(carouselData)
      setProfile({
        ...DEFAULT_PROFILE,
        ...(profileData || {}),
        tools: profileData && Array.isArray(profileData.tools) ? profileData.tools : DEFAULT_PROFILE.tools,
        specialties: profileData && Array.isArray(profileData.specialties) ? profileData.specialties : DEFAULT_PROFILE.specialties,
      })
      if (servicesData && servicesData.length > 0) setServices(servicesData)
      if (projectsData && projectsData.length > 0) setProjects(projectsData)
      if (galleryData && galleryData.length > 0) setGalleryItems(galleryData)
      setLoaded(true)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (isCarouselPaused) return
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % carouselImages.length), 6000)
    return () => clearInterval(timer)
  }, [isCarouselPaused, carouselImages.length])

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % carouselImages.length)
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + carouselImages.length) % carouselImages.length)

  if (!loaded) {
    return (
      <Layout>
        <div className="aura-background-component fixed top-0 w-full h-screen -z-10">
          <div className="absolute top-0 left-0 -z-10 w-full h-full">
            <UnicornScene projectId="qTiAlX0sxkuBOAiL7qHL" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="aura-background-component fixed top-0 w-full h-screen -z-10">
        <div className="absolute top-0 left-0 -z-10 w-full h-full">
          <UnicornScene projectId="qTiAlX0sxkuBOAiL7qHL" />
        </div>
      </div>

      <main className="max-w-7xl sm:px-6 mr-auto ml-auto pr-4 pb-1 pl-4">

        {/* ── Hero ── */}
        <motion.div
          className="bg-white rounded-3xl space-y-4"
          initial="hidden" animate="show" variants={stagger(0.1)}
        >
          <motion.div variants={fadeUp} className="bg-white rounded-3xl mt-8 pt-4 pr-4 pb-4 pl-4">
            <h2 className="text-[14vw] sm:text-[10vw] lg:text-[7vw] leading-[0.9] py-6 font-light tracking-tight">
              {profile.name.toUpperCase()} <span className="text-neutral-400 font-light tracking-tight">STUDIO</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4" style={{ minHeight: '600px' }}>
            {/* Carousel */}
            <motion.section variants={scaleIn} className="lg:col-span-2 flex">
              <div className="relative overflow-hidden rounded-3xl bg-neutral-100 w-full">
                <div
                  className="relative h-[600px]"
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                >
                  {carouselImages.map((image, index) => (
                    <div key={image.id || index} className={`absolute inset-0 transition-opacity duration-500 ease-out ${currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <img src={image.src} alt={image.alt} className="h-full w-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
                    </div>
                  ))}
                  <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-xl transition bg-neutral-900/70 text-white hover:bg-neutral-900">
                    <iconify-icon icon="solar:alt-arrow-left-linear" width="20" height="20"></iconify-icon>
                  </button>
                  <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 transition hover:bg-neutral-900 text-white bg-neutral-900/70 rounded-xl items-center justify-center">
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="20" height="20"></iconify-icon>
                  </button>
                  <div className="absolute left-4 bottom-4">
                    <Link to="/projects" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium backdrop-blur transition bg-white/90 text-neutral-900 hover:bg-white">
                      Voir les projets
                      <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16"></iconify-icon>
                    </Link>
                  </div>
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2">
                    {carouselImages.map((_, index) => (
                      <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`} aria-label={`Slide ${index + 1}`} />
                    ))}
                  </div>
                  <div className="absolute right-3 bottom-3">
                    <span className="rounded-2xl px-3 py-1 text-xs font-medium backdrop-blur bg-white/90 text-neutral-700">Selected Work</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Profil sidebar */}
            <motion.aside variants={stagger(0.12)} className="flex flex-col" style={{ height: '600px' }}>
              <div className="flex-1 flex flex-col space-y-4">
                <motion.div variants={fadeUp} className="ring-1 ring-neutral-200 bg-white rounded-3xl pt-5 pr-5 pb-5 pl-5 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight">{profile.name}</h2>
                  <p className="text-sm text-neutral-600">{profile.title}</p>
                  <p className="mt-3 text-sm leading-6 text-neutral-700">{profile.bio_intro}</p>
                </motion.div>
                <motion.div variants={scaleIn} className="ring-1 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ba34171-fc4e-49ee-a2c4-13a87fd225c6_1600w.jpg)] bg-cover rounded-3xl pt-20 pr-5 pb-20 pl-5 shadow-sm ring-neutral-200 bg-white flex-1 min-h-0"></motion.div>
                <motion.div variants={stagger(0.07)} className="space-y-3">
                  {(Array.isArray(profile.social_links)
                    ? profile.social_links.filter(s => s.active && s.url && s.url !== '#')
                    : [
                        { id: 'instagram', name: 'Instagram', icon: 'simple-icons:instagram', url: profile.instagram_url || '#', active: true },
                        { id: 'behance',   name: 'Behance',   icon: 'simple-icons:behance',   url: profile.behance_url   || '#', active: true },
                        { id: 'linkedin',  name: 'LinkedIn',  icon: 'simple-icons:linkedin',  url: profile.linkedin_url  || '#', active: true },
                      ]
                  ).map((item) => (
                    <motion.a key={item.id || item.name} variants={fadeLeft} href={item.url || item.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl px-4 py-3 ring-1 transition bg-white ring-neutral-200 hover:bg-neutral-50">
                      <span className="text-sm font-medium text-neutral-800">{item.name || item.label}</span>
                      <iconify-icon icon={item.icon} width="20" height="20" style={{ color: '#737373' }}></iconify-icon>
                    </motion.a>
                  ))}
                  <motion.a variants={fadeLeft} href="#contact" className="flex items-center justify-between rounded-2xl px-4 py-3 ring-1 transition bg-neutral-900 ring-neutral-200 hover:bg-black">
                    <span className="text-sm font-medium text-white">Contact</span>
                    <iconify-icon icon="solar:letter-linear" width="20" height="20" className="text-white"></iconify-icon>
                  </motion.a>
                </motion.div>
              </div>
            </motion.aside>
          </div>
        </motion.div>

        {/* ── Projets récents ── */}
        <ScrollSection className="bg-white rounded-3xl mt-8 pt-6 pr-6 pb-6 pl-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Portfolio</p>
            <span className="text-xs font-medium text-neutral-500">({String(projects.length).padStart(2, '0')})</span>
          </div>
          <div className="flex gap-6 items-start justify-between mb-8">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-6xl text-neutral-900 font-light tracking-tight">Derniers projets du portfolio.</h2>
              <p className="mt-4 text-sm md:text-base text-neutral-600">Identités visuelles, contenus sociaux et créations graphiques par {profile.name} — minimalistes, impactants et pensés pour engager.</p>
            </div>
            <Link to="/projects" className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition bg-neutral-100 ring-1 ring-neutral-200 hover:bg-neutral-200 text-neutral-900">
              Voir tous les projets
              <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}
            variants={stagger(0.1)}
          >
            {projects.slice(0, 1).map(project => (
              <motion.div key={project.id} variants={scaleIn} className="lg:col-span-2">
                <Link to={`/projects/${project.slug}`} className="block rounded-3xl p-1 ring-1 bg-neutral-50 ring-neutral-200 hover:ring-neutral-400 transition group">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={project.cover_url} alt={project.title} className="h-[360px] md:h-[460px] w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur">{project.category}</span>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0"><div className="h-40 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent"></div></div>
                    <div className="absolute left-4 right-4 bottom-4">
                      <p className="text-xs font-medium text-white/80">{project.date}</p>
                      <h3 className="mt-1 text-xl md:text-2xl text-white font-light tracking-tight">{project.title}</h3>
                      <p className="mt-2 text-sm text-white/80">{project.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {projects.slice(1, 5).map(project => (
              <motion.div key={project.id} variants={fadeUp}>
                <Link to={`/projects/${project.slug}`} className="block rounded-3xl p-1 ring-1 bg-neutral-50 ring-neutral-200 hover:ring-neutral-400 transition group h-full">
                  <div className="overflow-hidden rounded-2xl relative">
                    <img src={project.cover_url} alt={project.title} className="h-[240px] md:h-[260px] w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur">{project.category}</span>
                  </div>
                  <div className="px-4 pt-4 pb-6">
                    <p className="text-xs font-medium text-neutral-500">{project.date}</p>
                    <h4 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">{project.title}</h4>
                    <p className="mt-2 text-sm text-neutral-600">{project.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6 sm:hidden">
            <Link to="/projects" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition bg-neutral-100 ring-1 ring-neutral-200 hover:bg-neutral-200 text-neutral-900 w-full justify-center">
              Voir tous les projets
              <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
            </Link>
          </div>
        </ScrollSection>

        {/* ── About ── */}
        <ScrollSection id="about" className="bg-white rounded-3xl mt-8 pt-6 pr-6 pb-6 pl-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/About</p>
            <span className="text-xs font-medium text-neutral-500">(02)</span>
          </div>
          <h3 className="text-4xl md:text-6xl text-neutral-900 mb-8 font-light tracking-tight">Derrière les créations.</h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div
              className="lg:col-span-8"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={fadeLeft}
            >
              <div className="relative overflow-hidden bg-neutral-50 ring-1 ring-neutral-200 rounded-3xl shadow-sm">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/0c1c4611-4743-407c-9375-ca363769720b_1600w.jpg" alt={profile.name} className="h-80 sm:h-96 w-full object-cover" />
                <div className="bg-white pt-6 pr-6 pb-6 pl-6">
                  <p className="text-lg text-neutral-700 leading-relaxed mb-4">{profile.bio_intro}</p>
                  <p className="text-neutral-600 mb-4">{profile.bio_main}</p>
                  <p className="text-neutral-600">{profile.bio_extra}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-4 flex flex-col gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger(0.15)}
            >
              <motion.div variants={fadeUp} className="ring-1 ring-neutral-200 bg-neutral-50 rounded-3xl pt-6 pr-6 pb-6 pl-6 shadow-sm">
                <div className="flex gap-2 text-xs text-neutral-500 mb-4 items-center uppercase tracking-wide">
                  <iconify-icon icon="solar:chart-square-linear" width="16" height="16"></iconify-icon>
                  <span>En chiffres</span>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(n => (
                    <div key={n}>
                      <p className="text-2xl text-neutral-900 font-light tracking-tight">{profile[`stat_${n}_value`]}</p>
                      <p className="text-sm text-neutral-600">{profile[`stat_${n}_label`]}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-neutral-900 rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-white/80 text-xs mb-4 uppercase tracking-wide">
                  <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
                  <span>Outils</span>
                </div>
                <div className="space-y-3">
                  {profile.tools.map((tool, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-white/90 text-sm">{tool.name}</span>
                      <span className="text-white/60 text-xs">{tool.level}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="ring-1 ring-neutral-200 bg-neutral-50 rounded-3xl pt-6 pr-6 pb-6 pl-6 shadow-sm">
                <div className="flex gap-2 text-xs text-neutral-500 mb-4 items-center uppercase tracking-wide">
                  <iconify-icon icon="solar:medal-star-linear" width="16" height="16"></iconify-icon>
                  <span>Spécialités</span>
                </div>
                <div className="space-y-2">
                  {profile.specialties.map((s, i) => (
                    <p key={i} className="text-sm text-neutral-600">{s}</p>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </ScrollSection>

        {/* ── Testimonials ── */}
        <ScrollSection className="relative overflow-hidden bg-neutral-900 rounded-3xl mt-8">
          <div className="pointer-events-none absolute inset-0">
            <motion.div initial={{ opacity: 0, x: -40, rotate: -6 }} whileInView={{ opacity: 1, x: 0, rotate: -6 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="absolute -left-6 sm:left-4 top-6 sm:top-10">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/9a421cf7-e975-430b-88c5-f554775493e1_800w.jpg" alt="" className="w-40 sm:w-52 md:w-64 rounded-2xl object-cover shadow-sm ring-1 ring-white/10" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40, rotate: 6 }} whileInView={{ opacity: 1, x: 0, rotate: 6 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 sm:right-8 top-8 sm:top-14">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c0aab170-b3d3-4816-9435-0ac1e1d853a3_800w.jpg" alt="" className="w-40 sm:w-52 md:w-64 rounded-2xl object-cover shadow-sm ring-1 ring-white/10" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -40, rotate: -12 }} whileInView={{ opacity: 1, x: 0, rotate: -12 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="absolute -left-4 sm:left-8 bottom-6 sm:bottom-10">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/eab41fb3-55ff-46e1-973d-56fe1a4282a3_800w.jpg" alt="" className="w-44 sm:w-60 md:w-72 rounded-2xl object-cover shadow-sm ring-1 ring-white/10" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40, rotate: 6 }} whileInView={{ opacity: 1, x: 0, rotate: 6 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="absolute right-2 sm:right-10 bottom-4 sm:bottom-8">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b59bad79-703a-4c05-8ed2-fafcc49a7b51_800w.jpg" alt="" className="w-40 sm:w-52 md:w-64 rounded-2xl object-cover shadow-sm ring-1 ring-white/10" />
            </motion.div>
          </div>
          <div className="relative max-w-4xl sm:px-6 text-center mr-auto ml-auto pt-16 pr-4 pb-16 pl-4">
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wide">/Témoignages</p>
              <span className="text-xs font-medium text-white/60">(clients)</span>
            </div>
            <motion.h2
              className="text-4xl sm:text-6xl md:text-7xl text-white leading-tight font-light tracking-tight"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {profile.testimonial_quote}
            </motion.h2>
            <motion.a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Collaborer avec moi
              <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16"></iconify-icon>
            </motion.a>
          </div>
        </ScrollSection>

        {/* ── Galerie ── */}
        {galleryItems.length > 0 && (
          <ScrollSection id="gallery" className="bg-white rounded-3xl mt-8 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Galerie</p>
                <h2 className="text-4xl md:text-6xl text-neutral-900 font-light tracking-tight mt-1">Créations récentes.</h2>
              </div>
              <span className="text-xs font-medium text-neutral-500 hidden sm:block">({String(galleryItems.length).padStart(2, '0')})</span>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}
              variants={stagger(0.07)}
            >
              {galleryItems.map((item, i) => {
                const wide = i % 3 === 0
                return (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    className={`group relative overflow-hidden rounded-2xl bg-neutral-100 ${wide ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title || ''}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                      {item.title && (
                        <p className="text-white text-sm font-semibold leading-tight">{item.title}</p>
                      )}
                      {item.description && (
                        <p className="text-white/80 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="rounded-full bg-white/20 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-white">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </ScrollSection>
        )}

        {/* ── Services ── */}
        <ScrollSection className="relative overflow-hidden bg-neutral-900 rounded-3xl mt-8">
          <div className="relative max-w-7xl sm:px-6 mr-auto ml-auto p-6">
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wide">/Services</p>
              <span className="text-xs font-medium text-white/60">({String(services.length).padStart(2, '0')})</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl text-white leading-tight mb-8 font-light tracking-tight">
              Des prestations créatives adaptées à vos besoins.
            </h2>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger(0.12)}
            >
              {services.map(service => {
                const features = Array.isArray(service.features) ? service.features : []
                return (
                  <motion.article key={service.id} variants={fadeUp} className="bg-white rounded-3xl p-1 ring-1 ring-neutral-200">
                    <div className="rounded-2xl bg-white p-6 sm:p-8">
                      {service.popular && (
                        <div className="flex justify-center mb-1">
                          <span className="inline-flex items-center rounded-full bg-neutral-900 text-white px-3 py-1 text-[11px] font-medium uppercase tracking-wide">{service.badge || 'Le plus demandé'}</span>
                        </div>
                      )}
                      {service.delivery && <p className="text-xs text-neutral-500 text-center uppercase tracking-wide mt-1">( {service.delivery} )</p>}
                      <h3 className="mt-2 text-2xl text-neutral-900 text-center font-light tracking-tight">{service.title}</h3>
                      {service.subtitle && <p className="mt-2 text-xs sm:text-sm text-neutral-600 text-center uppercase tracking-wide">{service.subtitle}</p>}
                      <div className="mt-5 overflow-hidden rounded-xl bg-neutral-900 text-white flex divide-x divide-white/10">
                        <div className="flex-1 py-3 text-center text-sm font-medium uppercase tracking-wide">{service.duration}</div>
                        <div className="flex-1 py-3 text-center text-sm font-semibold">{service.price}</div>
                      </div>
                      <ul className="mt-5 text-sm">
                        {features.map((feat, i) => (
                          <li key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-dotted border-neutral-200' : ''}`}>
                            <iconify-icon icon={feat.included ? 'solar:check-square-linear' : 'solar:minus-circle-linear'} width="16" height="16" className={feat.included ? 'text-neutral-900' : 'text-neutral-400'}></iconify-icon>
                            <span className={feat.included ? 'text-neutral-800' : 'text-neutral-400'}>{feat.text}</span>
                          </li>
                        ))}
                      </ul>
                      <a href="#contact" className="mt-6 w-full inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-black transition">
                        Me contacter
                      </a>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          </div>
        </ScrollSection>

        {/* ── Footer ── */}
        <motion.footer
          id="contact"
          className="mt-8 mb-8"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={scrollFadeUp}
        >
          <div className="w-full rounded-3xl bg-neutral-900 text-white p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="flex flex-col justify-between">
                <h3 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight">{profile.name.toUpperCase()}</h3>
                <div className="mt-6 space-y-1">
                  {profile.phone && <p className="text-sm text-white/70">{profile.phone}</p>}
                  <p className="text-2xl sm:text-3xl font-light tracking-tight">{profile.email}</p>
                </div>
              </div>
              <div>
                <h4 className="text-3xl font-light tracking-tight">Let's connect</h4>
                <p className="mt-2 text-sm text-white/70">Abonnez-vous pour suivre mes dernières créations et projets.</p>
                <form className="mt-5" onSubmit={e => {
                  e.preventDefault()
                  const email = e.target.elements.email.value.trim()
                  if (!email) return
                  const to = profile.email || ''
                  window.location.href = `mailto:${to}?subject=Contact depuis le portfolio&body=Bonjour, je souhaite vous contacter. Mon adresse email est : ${email}`
                }}>
                  <div className="flex items-center gap-3 border-b border-white/20 pb-2">
                    <input name="email" type="email" placeholder="E-mail" required className="flex-1 bg-transparent placeholder-white/60 text-white text-sm focus:outline-none" />
                    <button type="submit" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 transition">
                      <iconify-icon icon="solar:arrow-right-linear" width="16" height="16"></iconify-icon>
                    </button>
                  </div>
                </form>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <ul className="space-y-2">
                  <li><a href="#about" className="text-sm text-white hover:text-white/80 font-medium transition">About</a></li>
                  <li><Link to="/projects" className="text-sm text-white hover:text-white/80 font-medium transition">Projects</Link></li>
                  <li><a href="#contact" className="text-sm text-white hover:text-white/80 font-medium transition">Contact</a></li>
                </ul>
                <ul className="space-y-2">
                  {(Array.isArray(profile.social_links)
                    ? profile.social_links.filter(s => s.active && s.url && s.url !== '#')
                    : [
                        { id: 'instagram', name: 'Instagram', url: profile.instagram_url },
                        { id: 'behance',   name: 'Behance',   url: profile.behance_url },
                        { id: 'linkedin',  name: 'LinkedIn',  url: profile.linkedin_url },
                      ]
                  ).map(s => (
                    <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-white/80 font-medium transition">{s.name}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <p className="text-xs text-white/70">© 2025 {profile.name}. Tous droits réservés.</p>
              <p className="text-sm text-white/70 sm:text-right">{profile.footer_tagline}</p>
            </div>
          </div>
        </motion.footer>
      </main>
    </Layout>
  )
}
