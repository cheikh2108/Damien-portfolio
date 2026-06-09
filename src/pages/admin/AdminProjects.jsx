import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { supabase } from '../../lib/supabase.js'

const CATEGORIES = ['Identité Visuelle', 'Social Media', 'Graphisme', 'Retouche', 'Community']

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: CATEGORIES[0],
  date: '',
  client: '',
  description: '',
  content: '',
  cover_url: '',
  tools: '',
  featured: false,
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url'

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    if (!isConfigured) { setLoading(false); return }
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !editId ? { slug: slugify(value) } : {}),
    }))
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(project) {
    setForm({
      ...project,
      tools: Array.isArray(project.tools) ? project.tools.join(', ') : (project.tools || ''),
    })
    setEditId(project.id)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      tools: form.tools ? form.tools.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    delete payload.id
    delete payload.created_at

    if (editId) {
      await supabase.from('projects').update(payload).eq('id', editId)
    } else {
      await supabase.from('projects').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    fetchProjects()
  }

  async function handleDelete(id) {
    await supabase.from('projects').delete().eq('id', id)
    setDeleteId(null)
    fetchProjects()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Admin</p>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">Projets</h1>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition"
          >
            <iconify-icon icon="solar:add-square-linear" width="16" height="16"></iconify-icon>
            Nouveau projet
          </button>
        </div>

        {!isConfigured && (
          <div className="bg-amber-50 rounded-3xl p-5 ring-1 ring-amber-200 text-sm text-amber-700">
            Configurez Supabase dans <code className="bg-amber-100 px-1 rounded">.env.local</code> pour gérer vos projets.
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl my-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{editId ? 'Modifier le projet' : 'Nouveau projet'}</h2>
                <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600">
                  <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Titre *</label>
                    <input name="title" required value={form.title} onChange={handleFormChange} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Slug *</label>
                    <input name="slug" required value={form.slug} onChange={handleFormChange} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Catégorie</label>
                    <select name="category" value={form.category} onChange={handleFormChange} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Date</label>
                    <input name="date" value={form.date} onChange={handleFormChange} placeholder="ex: Mai 2025" className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Client</label>
                    <input name="client" value={form.client} onChange={handleFormChange} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">URL de couverture</label>
                    <input name="cover_url" value={form.cover_url} onChange={handleFormChange} placeholder="https://..." className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Description courte</label>
                    <input name="description" value={form.description} onChange={handleFormChange} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Contenu détaillé</label>
                    <textarea name="content" value={form.content} onChange={handleFormChange} rows={4} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Outils (séparés par des virgules)</label>
                    <input name="tools" value={form.tools} onChange={handleFormChange} placeholder="Photoshop, Illustrator, Figma" className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleFormChange} className="h-4 w-4 rounded border-neutral-300 accent-neutral-900" />
                    <label htmlFor="featured" className="text-sm font-medium text-neutral-700">Projet mis en avant</label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50">
                    {saving ? 'Enregistrement...' : (editId ? 'Mettre à jour' : 'Créer le projet')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="text-lg font-semibold mb-2">Supprimer ce projet ?</h2>
              <p className="text-sm text-neutral-600 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Annuler</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {/* Projects list */}
        <div className="bg-white rounded-3xl ring-1 ring-neutral-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <iconify-icon icon="solar:folder-open-linear" width="40" height="40" className="text-neutral-300 mx-auto"></iconify-icon>
              <p className="mt-4 text-sm text-neutral-500">Aucun projet pour l'instant.</p>
              <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition">
                Créer le premier projet
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {projects.map(project => (
                <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition">
                  {project.cover_url && (
                    <img src={project.cover_url} alt={project.title} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{project.title}</p>
                      {project.featured && (
                        <span className="rounded-full bg-neutral-900 text-white px-2 py-0.5 text-[10px] font-medium uppercase">Featured</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{project.category} · {project.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(project)} className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition">
                      <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
                    </button>
                    <button onClick={() => setDeleteId(project.id)} className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600 transition">
                      <iconify-icon icon="solar:trash-bin-minimalistic-linear" width="16" height="16"></iconify-icon>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
