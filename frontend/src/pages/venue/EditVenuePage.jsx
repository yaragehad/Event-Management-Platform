import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { getVenueById, updateVenue } from '../../services/venueService'

const BACKEND = 'http://localhost:3001'

async function uploadFiles(endpoint, files) {
  const formData = new FormData()
  const field = endpoint === 'photos' ? 'photos' : 'documents'
  files.forEach(f => formData.append(field, f))
  const res = await fetch(`${BACKEND}/api/upload/${endpoint}`, { method: 'POST', body: formData })
  const data = await res.json()
  return data.urls.map(u => `${BACKEND}${u}`)
}

export default function EditVenuePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [existingPhotos, setExistingPhotos] = useState([])
  const [newPhotoFiles, setNewPhotoFiles] = useState([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([])
  const [existingDocs, setExistingDocs] = useState([])
  const [newDocFiles, setNewDocFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getVenueById(id).then(res => {
      setForm(res.data)
      setExistingPhotos(res.data.photos || [])
      setExistingDocs(res.data.layoutDocuments || [])
      setLoading(false)
    })
  }, [id])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    setNewPhotoFiles(prev => [...prev, ...files])
    setNewPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const handleDocSelect = (e) => {
    setNewDocFiles(prev => [...prev, ...Array.from(e.target.files)])
  }

  const handleSubmit = async () => {
    if (parseInt(form.capacity) < 50) { alert('Capacity must be at least 50 guests'); return }
    if (form.areaM2 && parseFloat(form.areaM2) < 20) { alert('Area must be at least 20 m²'); return }
    setSaving(true)
    try {
      const uploadedPhotos = newPhotoFiles.length ? await uploadFiles('photos', newPhotoFiles) : []
      const uploadedDocs = newDocFiles.length ? await uploadFiles('documents', newDocFiles) : []
      await updateVenue(id, {
        name: form.name, description: form.description,
        location: form.location, city: form.city,
        capacity: parseInt(form.capacity),
        areaM2: form.areaM2 ? parseFloat(form.areaM2) : null,
        amenities: form.amenities,
        pricePerDay: parseFloat(form.pricePerDay),
        photos: [...existingPhotos, ...uploadedPhotos],
        layoutDocuments: [...existingDocs, ...uploadedDocs],
      })
      alert('Venue updated successfully!')
      navigate('/venue/listings')
    } catch {
      alert('Failed to update venue')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem',
    border: `1px solid ${COLORS.border}`, borderRadius: '8px',
    fontSize: '14px', color: COLORS.text, background: COLORS.white,
    outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', marginBottom: '0.4rem',
    fontSize: '13px', fontWeight: '600', color: COLORS.text
  }

  if (loading) return (
    <VenueLayout title="Edit Venue">
      <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>Loading venue...</div>
    </VenueLayout>
  )

  return (
    <VenueLayout title={`Edit: ${form.name}`}>
      <div style={{ maxWidth: '720px' }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '2rem' }}>

          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Basic Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Venue Name</label>
              <input name="name" value={form.name || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} style={{ ...inputStyle, height: '90px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input name="location" value={form.location || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" value={form.city || ''} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Capacity & Pricing
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Capacity</label>
              <input name="capacity" type="number" min="50" value={form.capacity || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Area (m²)</label>
              <input name="areaM2" type="number" min="20" value={form.areaM2 || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price per Day (EGP)</label>
              <input name="pricePerDay" type="number" min="0" value={form.pricePerDay || ''} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Amenities
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Available Amenities</label>
            <input name="amenities" value={form.amenities || ''} onChange={handleChange} style={inputStyle} placeholder="e.g. Parking, WiFi, Kitchen" />
          </div>

          {/* Photos */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Property Photos
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            {existingPhotos.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: COLORS.textMuted, fontWeight: '600' }}>Current photos</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {existingPhotos.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', border: `1px solid ${COLORS.border}` }} />
                      <button onClick={() => setExistingPhotos(prev => prev.filter((_, idx) => idx !== i))} style={{
                        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                        background: '#C0392B', color: '#fff', border: 'none', borderRadius: '50%',
                        cursor: 'pointer', fontSize: '11px'
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem', background: COLORS.accentLight,
              border: `1px dashed ${COLORS.accent}`, borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', color: COLORS.accent, fontWeight: '600', width: 'fit-content'
            }}>
              📷 Add More Photos
              <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{ display: 'none' }} />
            </label>
            {newPhotoPreviews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {newPhotoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', border: `1px solid ${COLORS.border}` }} />
                    <button onClick={() => { setNewPhotoFiles(p => p.filter((_, idx) => idx !== i)); setNewPhotoPreviews(p => p.filter((_, idx) => idx !== i)) }} style={{
                      position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                      background: '#C0392B', color: '#fff', border: 'none', borderRadius: '50%',
                      cursor: 'pointer', fontSize: '11px'
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Layout Documents */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Spatial Layout Documents
          </h3>
          <div style={{ marginBottom: '2rem' }}>
            {existingDocs.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: COLORS.textMuted, fontWeight: '600' }}>Current documents</p>
                {existingDocs.map((url, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#EEF2FF', borderRadius: '8px', fontSize: '13px', marginBottom: '6px' }}>
                    <span>{url.endsWith('.pdf') ? '📄' : '🖼'}</span>
                    <a href={url} target="_blank" rel="noreferrer" style={{ flex: 1, color: '#4F46E5', fontWeight: '500', textDecoration: 'none' }}>
                      {url.split('/').pop()}
                    </a>
                    <button onClick={() => setExistingDocs(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontWeight: '700' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem', background: '#EEF2FF',
              border: '1px dashed #818CF8', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', color: '#4F46E5', fontWeight: '600', width: 'fit-content'
            }}>
              📄 Upload Floor Plans / Documents
              <input type="file" accept="image/*,.pdf" multiple onChange={handleDocSelect} style={{ display: 'none' }} />
            </label>
            <p style={{ margin: '6px 0 10px', fontSize: '12px', color: COLORS.textMuted }}>PDF or image files — up to 5 documents</p>
            {newDocFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#EEF2FF', borderRadius: '8px', fontSize: '13px', marginBottom: '6px' }}>
                <span>{f.name.endsWith('.pdf') ? '📄' : '🖼'}</span>
                <span style={{ flex: 1, color: '#4F46E5', fontWeight: '500' }}>{f.name}</span>
                <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>{(f.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => setNewDocFiles(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontWeight: '700' }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/venue/listings')} style={{ flex: 1, padding: '0.8rem', background: COLORS.cream, border: `1px solid ${COLORS.border}`, borderRadius: '9px', cursor: 'pointer', fontSize: '15px', color: COLORS.text, fontWeight: '600' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: '0.8rem', background: COLORS.accent, color: COLORS.white, border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </VenueLayout>
  )
}
