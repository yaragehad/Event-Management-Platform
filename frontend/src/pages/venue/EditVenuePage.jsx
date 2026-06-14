import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { getVenueById, updateVenue } from '../../services/venueService'

export default function EditVenuePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getVenueById(id).then(res => {
      setForm(res.data)
      setLoading(false)
    })
  }, [id])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await updateVenue(id, {
        name: form.name, description: form.description,
        location: form.location, city: form.city,
        capacity: parseInt(form.capacity),
        areaM2: form.areaM2 ? parseFloat(form.areaM2) : null,
        amenities: form.amenities,
        pricePerDay: parseFloat(form.pricePerDay)
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
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.border}`,
          borderRadius: '12px', padding: '2rem'
        }}>

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
              <input name="capacity" type="number" value={form.capacity || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Area (m²)</label>
              <input name="areaM2" type="number" value={form.areaM2 || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price per Day (EGP)</label>
              <input name="pricePerDay" type="number" value={form.pricePerDay || ''} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem' }}>
            Amenities
          </h3>
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Available Amenities</label>
            <input name="amenities" value={form.amenities || ''} onChange={handleChange} style={inputStyle} placeholder="e.g. Parking, WiFi, Kitchen" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/venue/listings')}
              style={{ flex: 1, padding: '0.8rem', background: COLORS.cream, border: `1px solid ${COLORS.border}`, borderRadius: '9px', cursor: 'pointer', fontSize: '15px', color: COLORS.text, fontWeight: '600' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ flex: 2, padding: '0.8rem', background: COLORS.accent, color: COLORS.white, border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </VenueLayout>
  )
}