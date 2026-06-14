import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
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

export default function CreateVenuePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [photoUrls, setPhotoUrls] = useState([''])
  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '',
    capacity: '', areaM2: '', amenities: '', pricePerDay: '', ownerId: 1
  })

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePhotoChange = (index, value) => {
    setPhotoUrls(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.city || !form.capacity || !form.pricePerDay) {
      alert('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await createVenue({
        ...form,
        capacity: parseInt(form.capacity),
        areaM2: form.areaM2 ? parseFloat(form.areaM2) : null,
        pricePerDay: parseFloat(form.pricePerDay),
        photos: photoUrls.filter(u => u.trim() !== '')
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
              <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="e.g. 300" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Area (m²)</label>
              <input name="areaM2" type="number" value={form.areaM2} onChange={handleChange} placeholder="e.g. 500" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price per Day (EGP) *</label>
              <input name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleChange} placeholder="e.g. 5000" style={inputStyle} />
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
            Photos
          </h3>
          <div style={{ marginBottom: '2rem' }}>
            {photoUrls.map((url, i) => (
              <input
                key={i} value={url}
                onChange={e => handlePhotoChange(i, e.target.value)}
                placeholder="Paste image URL here"
                style={{ ...inputStyle, marginBottom: '0.5rem' }}
              />
            ))}
            <button
              onClick={() => setPhotoUrls(prev => [...prev, ''])}
              style={{
                background: 'none', border: `1px dashed ${COLORS.border}`,
                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                color: COLORS.textMuted, fontSize: '13px'
              }}
            >
              + Add another photo
            </button>
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