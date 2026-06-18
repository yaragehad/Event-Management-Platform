import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { AuthContext } from '../../context/AuthContext'
import { createVenue } from '../../services/venueService'

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

const BACKEND = 'http://localhost:3001'

async function uploadFiles(endpoint, files) {
  const formData = new FormData()
  const field = endpoint === 'photos' ? 'photos' : 'documents'
  files.forEach(f => formData.append(field, f))
  const res = await fetch(`${BACKEND}/api/upload/${endpoint}`, { method: 'POST', body: formData })
  const data = await res.json()
  return data.urls.map(u => `${BACKEND}${u}`)
}

export default function CreateVenuePage() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [submitting, setSubmitting] = useState(false)
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [docFiles, setDocFiles] = useState([])
  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '',
    capacity: '', areaM2: '', amenities: '', pricePerDay: ''
  })

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    setPhotoFiles(prev => [...prev, ...files])
    setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePhoto = (i) => {
    setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))
    setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleDocSelect = (e) => {
    setDocFiles(prev => [...prev, ...Array.from(e.target.files)])
  }

  const removeDoc = (i) => setDocFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.city || !form.capacity || !form.pricePerDay) {
      alert('Please fill in all required fields')
      return
    }
    if (parseInt(form.capacity) < 50) {
      alert('Capacity must be at least 50 guests')
      return
    }
    if (form.areaM2 && parseFloat(form.areaM2) < 20) {
      alert('Area must be at least 20 m²')
      return
    }
    setSubmitting(true)
    try {
      const photos = photoFiles.length ? await uploadFiles('photos', photoFiles) : []
      const layoutDocuments = docFiles.length ? await uploadFiles('documents', docFiles) : []
      await createVenue({
        ...form,
        ownerId: user.id,
        capacity: parseInt(form.capacity),
        areaM2: form.areaM2 ? parseFloat(form.areaM2) : null,
        pricePerDay: parseFloat(form.pricePerDay),
        photos,
        layoutDocuments,
      })
      alert('Venue created successfully!')
      navigate('/venue/listings')
    } catch {
      alert('Failed to create venue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <VenueLayout title="Create New Listing">
      <div style={{ maxWidth: '720px' }}>
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.border}`,
          borderRadius: '12px', padding: '2rem'
        }}>

          {/* Basic Info */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Basic Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Venue Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. The Grand Hall" style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe what makes your venue special..."
                style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Street Address *</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. 15 Tahrir Square" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Cairo" style={inputStyle} />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Capacity & Pricing
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Capacity *</label>
              <input name="capacity" type="number" min="50" value={form.capacity} onChange={handleChange} placeholder="e.g. 300" style={{ ...inputStyle, borderColor: form.capacity && parseInt(form.capacity) < 50 ? '#C0392B' : COLORS.border }} />
              {form.capacity && parseInt(form.capacity) < 50 && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B', fontWeight: '600' }}>Minimum capacity is 50 guests</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Area (m²)</label>
              <input name="areaM2" type="number" min="20" value={form.areaM2} onChange={handleChange} placeholder="e.g. 500" style={{ ...inputStyle, borderColor: form.areaM2 && parseFloat(form.areaM2) < 20 ? '#C0392B' : COLORS.border }} />
              {form.areaM2 && parseFloat(form.areaM2) < 20 && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#C0392B', fontWeight: '600' }}>Minimum area is 20 m²</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Price per Day (EGP) *</label>
              <input name="pricePerDay" type="number" min="0" value={form.pricePerDay} onChange={handleChange} placeholder="e.g. 5000" style={inputStyle} />
            </div>
          </div>

          {/* Amenities */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Amenities
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Available Amenities</label>
            <input
              name="amenities" value={form.amenities} onChange={handleChange}
              placeholder="e.g. Parking, WiFi, Kitchen, Stage, AV Equipment"
              style={inputStyle}
            />
          </div>

          {/* Photos */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Property Photos
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem', background: COLORS.accentLight,
              border: `1px dashed ${COLORS.accent}`, borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', color: COLORS.accent, fontWeight: '600', width: 'fit-content'
            }}>
              📷 Choose Photos
              <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{ display: 'none' }} />
            </label>
            <p style={{ margin: '6px 0 10px', fontSize: '12px', color: COLORS.textMuted }}>JPG, PNG, WEBP — up to 10 photos, 10MB each</p>
            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '8px', border: `1px solid ${COLORS.border}` }} />
                    <button onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                      background: '#C0392B', color: '#fff', border: 'none', borderRadius: '50%',
                      cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center'
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
            {docFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {docFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#EEF2FF', borderRadius: '8px', fontSize: '13px' }}>
                    <span>{f.name.endsWith('.pdf') ? '📄' : '🖼'}</span>
                    <span style={{ flex: 1, color: '#4F46E5', fontWeight: '500' }}>{f.name}</span>
                    <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontWeight: '700' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/venue/listings')}
              style={{
                flex: 1, padding: '0.8rem', background: COLORS.cream,
                border: `1px solid ${COLORS.border}`, borderRadius: '9px',
                cursor: 'pointer', fontSize: '15px', color: COLORS.text, fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 2, padding: '0.8rem', background: COLORS.accent,
                color: COLORS.white, border: 'none', borderRadius: '9px',
                cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Creating...' : 'Create Venue'}
            </button>
          </div>

        </div>
      </div>
    </VenueLayout>
  )
}