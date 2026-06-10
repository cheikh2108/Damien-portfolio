import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { supabase } from '../../lib/supabase.js'

const LEVELS = ['Maîtrisé', 'Avancé', 'Intermédiaire', 'Notions']

const ALL_NETWORKS = [
  { id: 'instagram', name: 'Instagram', icon: 'simple-icons:instagram' },
  { id: 'behance',   name: 'Behance',   icon: 'simple-icons:behance' },
  { id: 'linkedin',  name: 'LinkedIn',  icon: 'simple-icons:linkedin' },
  { id: 'tiktok',    name: 'TikTok',    icon: 'simple-icons:tiktok' },
  { id: 'twitter',   name: 'X / Twitter', icon: 'simple-icons:x' },
  { id: 'youtube',   name: 'YouTube',   icon: 'simple-icons:youtube' },
  { id: 'pinterest', name: 'Pinterest', icon: 'simple-icons:pinterest' },
  { id: 'facebook',  name: 'Facebook',  icon: 'simple-icons:facebook' },
  { id: 'discord',   name: 'Discord',   icon: 'simple-icons:discord' },
  { id: 'snapchat',  name: 'Snapchat',  icon: 'simple-icons:snapchat' },
]

const DEFAULT_SOCIAL_LINKS = ALL_NETWORKS.map(n => ({
  ...n, url: '', active: ['instagram', 'behance', 'linkedin'].includes(n.id),
}))

const DEFAULT = {
  name: 'Damien',
  title: 'Community Manager & Graphiste Junior',
  bio_intro: 'Community Manager et Graphiste Junior passionné par la création de contenus visuels qui marquent les esprits.',
  bio_main: 'Maîtrisant la suite Adobe (Photoshop, Illustrator, Premiere Pro) et les codes des réseaux sociaux, je crée des identités visuelles cohérentes, des contenus engageants et des campagnes qui résonnent avec les audiences cibles.',
  bio_extra: 'Curieux et créatif, je touche à tout : du graphisme print au motion design, en passant par la gestion de communautés et la stratégie de contenu.',
  stat_1_value: '50+', stat_1_label: 'Projets réalisés',
  stat_2_value: '2+', stat_2_label: "Ans d'expérience",
  stat_3_value: '10+', stat_3_label: 'Marques accompagnées',
  tools: [{ name: 'Photoshop', level: 'Maîtrisé' }, { name: 'Illustrator', level: 'Maîtrisé' }, { name: 'Premiere Pro', level: 'Avancé' }, { name: 'Canva / Figma', level: 'Avancé' }],
  specialties: ['Identité visuelle & branding', 'Contenus réseaux sociaux', 'Retouche & montage photo'],
  phone: '', email: 'hello@damien.studio',
  social_links: DEFAULT_SOCIAL_LINKS,
  testimonial_quote: "Travailler avec Damien, c'est allier créativité, réactivité et un sens aigu du détail visuel.",
  footer_tagline: 'Community Manager & Graphiste Junior',
}

export default function AdminProfile() {
  const [form, setForm] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profile').select('*').eq('id', 1).single()
      if (data) {
        // Merge saved social_links with ALL_NETWORKS to always show all networks
        let social_links = DEFAULT_SOCIAL_LINKS
        if (Array.isArray(data.social_links) && data.social_links.length > 0) {
          social_links = ALL_NETWORKS.map(n => {
            const saved = data.social_links.find(s => s.id === n.id)
            return saved ? { ...n, url: saved.url || '', active: !!saved.active } : { ...n, url: '', active: false }
          })
        } else {
          // Migrate legacy fields
          social_links = ALL_NETWORKS.map(n => ({
            ...n,
            url: data[`${n.id}_url`] || '',
            active: ['instagram', 'behance', 'linkedin'].includes(n.id),
          }))
        }
        setForm({
          ...DEFAULT,
          ...data,
          tools: Array.isArray(data.tools) ? data.tools : DEFAULT.tools,
          specialties: Array.isArray(data.specialties) ? data.specialties : DEFAULT.specialties,
          social_links,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  // Tools
  function setTool(i, field, val) {
    const t = [...form.tools]
    t[i] = { ...t[i], [field]: val }
    set('tools', t)
  }
  function addTool() { set('tools', [...form.tools, { name: '', level: 'Avancé' }]) }
  function removeTool(i) { set('tools', form.tools.filter((_, idx) => idx !== i)) }

  // Social links
  function setSocialUrl(id, url) {
    set('social_links', form.social_links.map(s => s.id === id ? { ...s, url } : s))
  }
  function toggleSocial(id) {
    const link = form.social_links.find(s => s.id === id)
    const activeCount = form.social_links.filter(s => s.active).length
    if (!link.active && activeCount >= 4) return
    set('social_links', form.social_links.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  // Specialties
  function setSpecialty(i, val) {
    const s = [...form.specialties]
    s[i] = val
    set('specialties', s)
  }
  function addSpecialty() { set('specialties', [...form.specialties, '']) }
  function removeSpecialty(i) { set('specialties', form.specialties.filter((_, idx) => idx !== i)) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profile').update({
      ...form,
      tools: form.tools.filter(t => t.name),
      specialties: form.specialties.filter(s => s),
      social_links: form.social_links,
    }).eq('id', 1)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Admin</p>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">Profil</h1>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50"
          >
            {saving ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <iconify-icon icon="solar:diskette-linear" width="16" height="16"></iconify-icon>}
            {saved ? 'Sauvegardé ✓' : 'Enregistrer'}
          </button>
        </div>

        {/* Infos générales */}
        <Section title="Infos générales" icon="solar:user-linear">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Prénom / Nom">
              <input value={form.name} onChange={e => set('name', e.target.value)} className={input} />
            </Field>
            <Field label="Titre / Métier">
              <input value={form.title} onChange={e => set('title', e.target.value)} className={input} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} className={input} />
            </Field>
            <Field label="Téléphone">
              <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className={input} placeholder="ex: +33 6 00 00 00 00" />
            </Field>
          </div>
        </Section>

        {/* Bio */}
        <Section title="Biographie" icon="solar:document-text-linear">
          <div className="space-y-4">
            <Field label="Phrase d'accroche">
              <textarea value={form.bio_intro} onChange={e => set('bio_intro', e.target.value)} rows={2} className={textarea} />
            </Field>
            <Field label="Paragraphe principal">
              <textarea value={form.bio_main} onChange={e => set('bio_main', e.target.value)} rows={3} className={textarea} />
            </Field>
            <Field label="Paragraphe secondaire">
              <textarea value={form.bio_extra} onChange={e => set('bio_extra', e.target.value)} rows={3} className={textarea} />
            </Field>
          </div>
        </Section>

        {/* Stats */}
        <Section title="Statistiques" icon="solar:chart-square-linear">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex gap-2">
                <div className="w-20 shrink-0">
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Valeur</label>
                  <input value={form[`stat_${n}_value`]} onChange={e => set(`stat_${n}_value`, e.target.value)} className={input} placeholder="50+" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Label</label>
                  <input value={form[`stat_${n}_label`]} onChange={e => set(`stat_${n}_label`, e.target.value)} className={input} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Outils */}
        <Section title="Outils maîtrisés" icon="solar:pen-linear">
          <div className="space-y-2">
            {form.tools.map((tool, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={tool.name}
                  onChange={e => setTool(i, 'name', e.target.value)}
                  placeholder="Nom de l'outil"
                  className={`${input} flex-1`}
                />
                <select
                  value={tool.level}
                  onChange={e => setTool(i, 'level', e.target.value)}
                  className={`${input} w-36`}
                >
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
                <button type="button" onClick={() => removeTool(i)} className="h-9 w-9 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500 transition">
                  <iconify-icon icon="solar:trash-bin-minimalistic-linear" width="16" height="16"></iconify-icon>
                </button>
              </div>
            ))}
            <button type="button" onClick={addTool} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
              Ajouter un outil
            </button>
          </div>
        </Section>

        {/* Spécialités */}
        <Section title="Spécialités" icon="solar:medal-star-linear">
          <div className="space-y-2">
            {form.specialties.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={s}
                  onChange={e => setSpecialty(i, e.target.value)}
                  placeholder="ex: Identité visuelle & branding"
                  className={`${input} flex-1`}
                />
                <button type="button" onClick={() => removeSpecialty(i)} className="h-9 w-9 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500 transition">
                  <iconify-icon icon="solar:trash-bin-minimalistic-linear" width="16" height="16"></iconify-icon>
                </button>
              </div>
            ))}
            <button type="button" onClick={addSpecialty} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
              <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
              Ajouter une spécialité
            </button>
          </div>
        </Section>

        {/* Réseaux sociaux */}
        <Section title="Réseaux sociaux" icon="solar:share-linear">
          {(() => {
            const activeCount = form.social_links.filter(s => s.active).length
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-neutral-500">Activez jusqu'à <strong>4 réseaux</strong> à afficher sur le site.</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activeCount >= 4 ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-600'}`}>
                    {activeCount}/4 actifs
                  </span>
                </div>
                {activeCount >= 4 && (
                  <div className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-4 py-2.5 text-xs text-amber-700">
                    <iconify-icon icon="solar:info-circle-linear" width="14" height="14" style={{ color: '#b45309' }}></iconify-icon>
                    Maximum atteint — désactivez un réseau avant d'en activer un autre.
                  </div>
                )}
                <div className="space-y-3">
                  {form.social_links.map(link => (
                    <div key={link.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${link.active ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 bg-white opacity-60'}`}>
                      <div className="flex items-center gap-2 w-28 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSocial(link.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${link.active ? 'bg-neutral-900' : 'bg-neutral-300'} ${!link.active && activeCount >= 4 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          title={!link.active && activeCount >= 4 ? 'Maximum 4 réseaux actifs' : ''}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${link.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                        <iconify-icon icon={link.icon} width="16" height="16" style={{ color: link.active ? '#171717' : '#a3a3a3' }}></iconify-icon>
                        <span className="text-xs font-medium text-neutral-700">{link.name}</span>
                      </div>
                      <input
                        value={link.url}
                        onChange={e => setSocialUrl(link.id, e.target.value)}
                        placeholder={`https://...`}
                        className={`${input} flex-1`}
                        disabled={!link.active}
                      />
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </Section>

        {/* Témoignage */}
        <Section title="Citation témoignage" icon="solar:chat-square-like-linear">
          <Field label="Texte affiché dans la section témoignages">
            <textarea value={form.testimonial_quote || ''} onChange={e => set('testimonial_quote', e.target.value)} rows={3} className={textarea} />
          </Field>
        </Section>

        {/* Footer */}
        <Section title="Footer" icon="solar:tag-linear">
          <Field label="Tagline footer">
            <input value={form.footer_tagline || ''} onChange={e => set('footer_tagline', e.target.value)} className={input} />
          </Field>
        </Section>
      </form>
    </AdminLayout>
  )
}

const input = 'w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition'
const textarea = 'w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition resize-none'

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-neutral-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <iconify-icon icon={icon} width="16" height="16" className="text-neutral-500"></iconify-icon>
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}
