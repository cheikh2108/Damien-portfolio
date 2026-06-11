import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { supabase } from '../../lib/supabase.js'

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTags, setEditTags] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(0)
  const fileRef = useRef(null)
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url'

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    if (!isConfigured) { setLoading(false); return }
    const { data } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess(0)
    let successCount = 0
    const errors = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: storageErr } = await supabase.storage
        .from('portfolio')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (storageErr) {
        errors.push(`${file.name}: ${storageErr.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)

      const { error: dbErr } = await supabase.from('gallery_items').insert({
        title: file.name.replace(/\.[^.]+$/, ''),
        image_url: publicUrl,
        storage_path: path,
        tags: [],
      })

      if (dbErr) {
        errors.push(`${file.name} (BDD): ${dbErr.message}`)
      } else {
        successCount++
      }
    }

    setUploading(false)
    if (errors.length) setUploadError(errors.join(' | '))
    if (successCount) setUploadSuccess(successCount)
    fetchItems()
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(item) {
    if (item.storage_path) {
      await supabase.storage.from('portfolio').remove([item.storage_path])
    }
    await supabase.from('gallery_items').delete().eq('id', item.id)
    setDeleteId(null)
    fetchItems()
  }

  function openEdit(item) {
    setEditItem(item)
    setEditTitle(item.title || '')
    setEditTags(Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''))
  }

  async function handleEditSave(e) {
    e.preventDefault()
    await supabase.from('gallery_items').update({
      title: editTitle,
      tags: editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }).eq('id', editItem.id)
    setEditItem(null)
    fetchItems()
  }

  const itemToDelete = items.find(i => i.id === deleteId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Admin</p>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">Galerie</h1>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!isConfigured || uploading}
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <iconify-icon icon="solar:upload-linear" width="16" height="16"></iconify-icon>
            )}
            {uploading ? 'Upload...' : 'Uploader des images'}
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {!isConfigured && (
          <div className="bg-amber-50 rounded-3xl p-5 ring-1 ring-amber-200 text-sm text-amber-700">
            Configurez Supabase dans <code className="bg-amber-100 px-1 rounded">.env.local</code> pour gérer la galerie.
            <br />Vous devrez aussi créer un bucket <strong>portfolio</strong> dans Supabase Storage.
          </div>
        )}

        {uploadError && (
          <div className="bg-red-50 rounded-2xl px-4 py-3 ring-1 ring-red-200 text-sm text-red-700 flex items-start gap-2">
            <iconify-icon icon="solar:danger-triangle-linear" width="16" height="16" class="shrink-0 mt-0.5"></iconify-icon>
            <div>
              <strong>Erreur upload :</strong> {uploadError}
            </div>
            <button onClick={() => setUploadError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
              <iconify-icon icon="solar:close-circle-linear" width="16" height="16"></iconify-icon>
            </button>
          </div>
        )}

        {uploadSuccess > 0 && (
          <div className="bg-green-50 rounded-2xl px-4 py-3 ring-1 ring-green-200 text-sm text-green-700 flex items-center gap-2">
            <iconify-icon icon="solar:check-circle-linear" width="16" height="16"></iconify-icon>
            {uploadSuccess} image{uploadSuccess > 1 ? 's' : ''} uploadée{uploadSuccess > 1 ? 's' : ''} avec succès.
            <button onClick={() => setUploadSuccess(0)} className="ml-auto text-green-400 hover:text-green-600">
              <iconify-icon icon="solar:close-circle-linear" width="16" height="16"></iconify-icon>
            </button>
          </div>
        )}

        {/* Edit modal */}
        {editItem && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Modifier</h2>
                <button onClick={() => setEditItem(null)} className="text-neutral-400 hover:text-neutral-600">
                  <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
                </button>
              </div>
              {editItem.image_url && (
                <img src={editItem.image_url} alt="" className="w-full h-40 object-cover rounded-2xl mb-4" />
              )}
              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Titre</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Tags (séparés par des virgules)</label>
                  <input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="branding, social, print" className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditItem(null)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Annuler</button>
                  <button type="submit" className="flex-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteId && itemToDelete && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="text-lg font-semibold mb-2">Supprimer cette image ?</h2>
              <p className="text-sm text-neutral-600 mb-4">L'image sera supprimée du storage et de la galerie.</p>
              {itemToDelete.image_url && (
                <img src={itemToDelete.image_url} alt="" className="w-full h-32 object-cover rounded-2xl mb-4" />
              )}
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Annuler</button>
                <button onClick={() => handleDelete(itemToDelete)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery grid */}
        <div className="bg-white rounded-3xl ring-1 ring-neutral-200 shadow-sm p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <iconify-icon icon="solar:gallery-linear" width="40" height="40" className="text-neutral-300 mx-auto"></iconify-icon>
              <p className="mt-4 text-sm text-neutral-500">Aucune image pour l'instant.</p>
              <button onClick={() => fileRef.current?.click()} disabled={!isConfigured} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50">
                Uploader la première image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(item => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden ring-1 ring-neutral-200">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(item)} className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 transition shadow">
                      <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
                    </button>
                    <button onClick={() => setDeleteId(item.id)} className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white text-red-600 hover:bg-red-50 transition shadow">
                      <iconify-icon icon="solar:trash-bin-minimalistic-linear" width="16" height="16"></iconify-icon>
                    </button>
                  </div>
                  {item.title && (
                    <div className="px-2 py-2 bg-white">
                      <p className="text-xs font-medium text-neutral-700 truncate">{item.title}</p>
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
