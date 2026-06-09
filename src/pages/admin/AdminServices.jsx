import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { supabase } from '../../lib/supabase.js'

const EMPTY = {
  title: '', subtitle: '', badge: '',
  duration: '', price: 'Sur devis', delivery: '',
  features: [], popular: false, sort_order: 0,
}

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('sort_order')
    setServices(data || [])
    setLoading(false)
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  // Features helpers
  function addFeature() { setForm(f => ({ ...f, features: [...f.features, { text: '', included: true }] })) }
  function setFeatureText(i, text) {
    const features = [...form.features]
    features[i] = { ...features[i], text }
    setField('features', features)
  }
  function setFeatureIncluded(i, included) {
    const features = [...form.features]
    features[i] = { ...features[i], included }
    setField('features', features)
  }
  function removeFeature(i) { setField('features', form.features.filter((_, idx) => idx !== i)) }

  function openNew() {
    setForm({ ...EMPTY, sort_order: services.length })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(s) {
    setForm({ ...s, features: Array.isArray(s.features) ? s.features : [] })
    setEditId(s.id)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, features: form.features.filter(f => f.text) }
    delete payload.id
    delete payload.created_at

    if (editId) {
      await supabase.from('services').update(payload).eq('id', editId)
    } else {
      await supabase.from('services').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    fetchServices()
  }

  async function handleDelete(id) {
    await supabase.from('services').delete().eq('id', id)
    setDeleteId(null)
    fetchServices()
  }

  const inp = 'w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition'

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">/Admin</p>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">Services</h1>
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition">
            <iconify-icon icon="solar:add-square-linear" width="16" height="16"></iconify-icon>
            Nouveau service
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl my-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{editId ? 'Modifier le service' : 'Nouveau service'}</h2>
                <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600">
                  <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Titre *</label>
                    <input required value={form.title} onChange={e => setField('title', e.target.value)} className={inp} placeholder="ex: Identité Visuelle" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Sous-titre</label>
                    <input value={form.subtitle} onChange={e => setField('subtitle', e.target.value)} className={inp} placeholder="ex: Pour votre marque" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Badge (optionnel)</label>
                    <input value={form.badge} onChange={e => setField('badge', e.target.value)} className={inp} placeholder="ex: Le plus demandé" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Durée / Format</label>
                    <input value={form.duration} onChange={e => setField('duration', e.target.value)} className={inp} placeholder="ex: Complet" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Prix</label>
                    <input value={form.price} onChange={e => setField('price', e.target.value)} className={inp} placeholder="ex: Sur devis" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Délai de livraison</label>
                    <input value={form.delivery} onChange={e => setField('delivery', e.target.value)} className={inp} placeholder="ex: Livraison sous 5 jours" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="popular" checked={form.popular} onChange={e => setField('popular', e.target.checked)} className="h-4 w-4 rounded border-neutral-300 accent-neutral-900" />
                    <label htmlFor="popular" className="text-sm font-medium text-neutral-700">Mettre en avant (badge "Le plus demandé")</label>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Prestations incluses</label>
                  <div className="space-y-2">
                    {form.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFeatureIncluded(i, !feat.included)}
                          className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-lg transition ${feat.included ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}
                          title={feat.included ? 'Inclus — cliquer pour exclure' : 'Non inclus — cliquer pour inclure'}
                        >
                          <iconify-icon icon={feat.included ? 'solar:check-square-linear' : 'solar:minus-circle-linear'} width="16" height="16"></iconify-icon>
                        </button>
                        <input
                          value={feat.text}
                          onChange={e => setFeatureText(i, e.target.value)}
                          placeholder="ex: Logo & charte graphique"
                          className={`${inp} flex-1`}
                        />
                        <button type="button" onClick={() => removeFeature(i)} className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition">
                          <iconify-icon icon="solar:trash-bin-minimalistic-linear" width="16" height="16"></iconify-icon>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeature} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
                      <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
                      Ajouter une prestation
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50">
                    {saving ? 'Enregistrement...' : (editId ? 'Mettre à jour' : 'Créer le service')}
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
              <h2 className="text-lg font-semibold mb-2">Supprimer ce service ?</h2>
              <p className="text-sm text-neutral-600 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">Annuler</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-3xl ring-1 ring-neutral-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <iconify-icon icon="solar:tag-linear" width="40" height="40" className="text-neutral-300 mx-auto"></iconify-icon>
              <p className="mt-4 text-sm text-neutral-500">Aucun service. Les services par défaut s'affichent sur le site.</p>
              <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition">
                Créer le premier service
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900">{s.title}</p>
                      {s.popular && <span className="rounded-full bg-neutral-900 text-white px-2 py-0.5 text-[10px] font-medium uppercase">Populaire</span>}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{s.duration && `${s.duration} · `}{s.price} · {Array.isArray(s.features) ? s.features.length : 0} prestations</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(s)} className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition">
                      <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
                    </button>
                    <button onClick={() => setDeleteId(s.id)} className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600 transition">
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
