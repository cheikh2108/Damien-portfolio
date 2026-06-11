import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { supabase } from '../../lib/supabase.js'

export default function AdminCarousel() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [altInput, setAltInput] = useState('')
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(0)
  const fileRef = useRef(null)

  useEffect(() => { fetchImages() }, [])

  async function fetchImages() {
    setLoading(true)
    const { data } = await supabase.from('carousel_images').select('*').order('sort_order')
    setImages(data || [])
    setLoading(false)
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess(0)
    const maxOrder = images.reduce((m, img) => Math.max(m, img.sort_order), -1)
    let successCount = 0
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const path = `carousel/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: storageErr } = await supabase.storage.from('portfolio').upload(path, file, { cacheControl: '3600' })
      if (storageErr) { errors.push(`${file.name}: ${storageErr.message}`); continue }
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)
      const { error: dbErr } = await supabase.from('carousel_images').insert({
        src: publicUrl,
        alt: file.name.replace(/\.[^.]+$/, ''),
        sort_order: maxOrder + i + 1,
        storage_path: path,
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
    fetchImages()
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleAddUrl(e) {
    e.preventDefault()
    if (!urlInput.trim()) return
    const maxOrder = images.reduce((m, img) => Math.max(m, img.sort_order), -1)
    await supabase.from('carousel_images').insert({
      src: urlInput.trim(),
      alt: altInput.trim(),
      sort_order: maxOrder + 1,
    })
    setUrlInput('')
    setAltInput('')
    setShowUrlForm(false)
    fetchImages()
  }

  async function handleDelete(img) {
    if (img.storage_path) {
      await supabase.storage.from('portfolio').remove([img.storage_path])
    }
    await supabase.from('carousel_images').delete().eq('id', img.id)
    setDeleteId(null)
    fetchImages()
  }

  async function moveUp(index) {
    if (index === 0) return
    const updated = [...images]
    const tmp = updated[index - 1].sort_order
    updated[index - 1] = { ...updated[index - 1], sort_order: updated[index].sort_order }
    updated[index] = { ...updated[index], sort_order: tmp }
    await Promise.all([
      supabase.from('carousel_images').update({ sort_order: updated[index - 1].sort_order }).eq('id', updated[index - 1].id),
      supabase.from('carousel_images').update({ sort_order: updated[index].sort_order }).eq('id', updated[index].id),
    ])
    fetchImages()
  }

  async function moveDown(index) {
    if (index === images.length - 1) return
    const updated = [...images]
    const tmp = updated[index + 1].sort_order
    updated[index + 1] = { ...updated[index + 1], sort_order: updated[index].sort_order }
    updated[index] = { ...updated[index], sort_order: tmp }
    await Promise.all([
      supabase.from('carousel_images').update({ sort_order: updated[index + 1].sort_order }).eq('id', updated[index + 1].id),
      supabase.from('carousel_images').update({ sort_order: updated[index].sort_order }).eq('id', updated[index].id),
    ])
    fetchImages()
  }

  async function updateAlt(id, alt) {
    await supabase.from('carousel_images').update({ alt }).eq('id', id)
  }

  const itemToDelete = images.find(i => i.id === deleteId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Admin</p>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">Carousel</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUrlForm(v => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
            >
              <iconify-icon icon="solar:link-linear" width="16" height="16"></iconify-icon>
              Ajouter une URL
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50"
            >
              {uploading
                ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                : <iconify-icon icon="solar:upload-linear" width="16" height="16"></iconify-icon>}
              {uploading ? 'Upload...' : 'Uploader'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
        </div>

        {/* URL form */}
        {showUrlForm && (
          <form onSubmit={handleAddUrl} className="bg-white rounded-3xl ring-1 ring-neutral-200 p-5 flex flex-col md:flex-row gap-3">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              required
            />
            <input
              value={altInput}
              onChange={e => setAltInput(e.target.value)}
              placeholder="Description (alt text)"
              className="w-48 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
            <button type="submit" className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition">
              Ajouter
            </button>
          </form>
        )}

        {uploadError && (
          <div className="bg-red-50 rounded-2xl px-4 py-3 ring-1 ring-red-200 text-sm text-red-700 flex items-start gap-2">
            <iconify-icon icon="solar:danger-triangle-linear" width="16" height="16" class="shrink-0 mt-0.5"></iconify-icon>
            <div><strong>Erreur upload :</strong> {uploadError}</div>
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

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl px-4 py-3 ring-1 ring-blue-200 text-sm text-blue-700 flex items-center gap-2">
          <iconify-icon icon="solar:info-circle-linear" width="16" height="16"></iconify-icon>
          L'ordre ici est l'ordre d'affichage sur le site. Utilisez les flèches pour réorganiser. Max recommandé : 6 images.
        </div>

        {/* Delete confirm */}
        {deleteId && itemToDelete && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="text-lg font-semibold mb-2">Supprimer cette image ?</h2>
              <img src={itemToDelete.src} alt="" className="w-full h-32 object-cover rounded-2xl mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Annuler</button>
                <button onClick={() => handleDelete(itemToDelete)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {/* Images list */}
        <div className="bg-white rounded-3xl ring-1 ring-neutral-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <iconify-icon icon="solar:gallery-linear" width="40" height="40" className="text-neutral-300 mx-auto"></iconify-icon>
              <p className="mt-4 text-sm text-neutral-500">Aucune image dans le carousel.</p>
              <p className="text-xs text-neutral-400 mt-1">Les 4 images par défaut s'affichent sur le site tant que cette liste est vide.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {images.map((img, index) => (
                <div key={img.id} className="flex items-center gap-4 px-5 py-3">
                  <img src={img.src} alt={img.alt} className="h-16 w-24 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      defaultValue={img.alt}
                      onBlur={e => updateAlt(img.id, e.target.value)}
                      placeholder="Description de l'image..."
                      className="w-full text-sm text-neutral-700 bg-transparent border-b border-transparent focus:border-neutral-300 focus:outline-none pb-0.5 transition"
                    />
                    <p className="text-xs text-neutral-400 mt-1 truncate">{img.src}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 transition">
                      <iconify-icon icon="solar:alt-arrow-up-linear" width="16" height="16"></iconify-icon>
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index === images.length - 1} className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 transition">
                      <iconify-icon icon="solar:alt-arrow-down-linear" width="16" height="16"></iconify-icon>
                    </button>
                    <button onClick={() => setDeleteId(img.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition">
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
