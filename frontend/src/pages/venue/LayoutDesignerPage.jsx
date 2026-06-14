import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { createVenue } from '../../services/venueService'

export default function CreateVenuePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [photoUrls, setPhotoUrls] = useState([''])
  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '',
    capacity: '', areaM2: '', amenities: '', pricePerDay: '', ownerId: 1
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhotoChange = (index, value) => {
    const updated = [...photoUrls]
    updated[index] = value
    setPhotoUrls(updated)
  }

  const removePhotoField = (index) => {
    const updated = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updated.length ? updated : ['']);
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
    } catch (err) {
      console.error(err)
      alert('Failed to create venue. Check your backend connection.')
    } finally {
      setSubmitting(false)
    }
  }

  // Safe fallback colors
  const safeColors = COLORS || {
    accent: '#3B82F6', white: '#FFFFFF', cream: '#F9FAFB',
    border: '#E5E7EB', text: '#1F2937', textMuted: '#6B7280'
  }

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem',
    border: `1px solid ${safeColors.border}`, borderRadius: '8px',
    fontSize: '14px', color: safeColors.text, background: safeColors.white,
    outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', marginBottom: '0.4rem',
    fontSize: '13px', fontWeight: '600', color: safeColors.text
  }

  const Field = ({ label, name, type = 'text', placeholder, span }) => (
    <div style={{ gridColumn: span ? '1 / -1' : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      <input
        name={name} type={type} value={form[name]}
        onChange={handleChange} placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )

  return (
    <VenueLayout title="Create New Listing">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{
          background: safeColors.white, border: `1px solid ${safeColors.border}`,
          borderRadius: '12px', padding: '2rem'
        }}>

          {/* Basic Info */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: safeColors.text, borderBottom: `1px solid ${safeColors.border}`, paddingBottom: '0.75rem' }}>
            Basic Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <Field label="Venue Name *" name="name" placeholder="e.g. The Grand Hall" span />
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe what makes your venue special..."
                style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
              />
            </div>
            <Field label="Street Address *" name="location" placeholder="e.g. 15 Tahrir Square" />
            <Field label="City *" name="city" placeholder="e.g. Cairo" />
          </div>

          {/* Capacity & Pricing */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: safeColors.text, borderBottom: `1px solid ${safeColors.border}`, paddingBottom: '0.75rem' }}>
            Capacity & Pricing
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Capacity *</label>
              <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} placeholder="e.g. 300" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Area (m²)</label>
              <input name="areaM2" type="number" min="1" value={form.areaM2} onChange={handleChange} placeholder="e.g. 500" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price / Day (EGP) *</label>
              <input name="pricePerDay" type="number" min="0" value={form.pricePerDay} onChange={handleChange} placeholder="e.g. 5000" style={inputStyle} />
            </div>
          </div>

          {/* Amenities */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: safeColors.text, borderBottom: `1px solid ${safeColors.border}`, paddingBottom: '0.75rem' }}>
            Amenities
          </h3>
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Available Amenities</label>
            <input
              name="amenities" value={form.amenities} onChange={handleChange}
              placeholder="e.g. Parking, WiFi, Kitchen, Stage, AV Equipment"
              style={inputStyle}
            />
          </div>

          {/* Photos */}
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: safeColors.text, borderBottom: `1px solid ${safeColors.border}`, paddingBottom: '0.75rem' }}>
            Photos
          </h3>
          <div style={{ marginBottom: '2rem' }}>
            {photoUrls.map((url, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  value={url}
                  onChange={e => handlePhotoChange(i, e.target.value)}
                  placeholder="Paste image URL here"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button 
                  onClick={() => removePhotoField(i)}
                  style={{ padding: '0 1rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => setPhotoUrls([...photoUrls, ''])}
              style={{
                background: 'none', border: `1px dashed ${safeColors.border}`,
                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                color: safeColors.textMuted, fontSize: '13px', marginTop: '0.5rem',
                width: '100%'
              }}
            >
              + Add another photo
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => navigate('/venue/listings')}
              style={{
                flex: 1, padding: '0.9rem', background: safeColors.cream,
                border: `1px solid ${safeColors.border}`, borderRadius: '9px',
                color: safeColors.text, fontWeight: '600', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 2, padding: '0.9rem', background: safeColors.accent,
                border: 'none', borderRadius: '9px',
                color: 'white', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s'
              }}
            >
              {submitting ? 'Creating...' : 'Create Venue Listing'}
            </button>
          </div>

        </div>
      </div>
    </VenueLayout>
  )
}