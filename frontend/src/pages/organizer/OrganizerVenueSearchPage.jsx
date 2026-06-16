import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getAllVenues } from '../../services/venueService'

const C = {
  sidebar: '#6B2D0E', accent: '#C4622D', accentLight: '#F5EDE8',
  cream: '#FBF7F4', border: '#EDE0D9', text: '#2C1810',
  textMuted: '#8B6555', white: '#FFFFFF',
  green: '#2D7A4F', greenBg: '#E8F5EE',
}

export default function OrganizerVenueSearchPage() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState(null)

  const [city, setCity] = useState('')
  const [minCapacity, setMinCapacity] = useState('')
  const [minArea, setMinArea] = useState('')
  const [date, setDate] = useState('')

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (city) filters.city = city
      if (minCapacity) filters.minCapacity = minCapacity
      if (minArea) filters.minArea = minArea
      if (date) filters.date = date
      const res = await getAllVenues(filters)
      setVenues(res.data)
    } catch {
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVenues() }, [])

  const clearFilters = () => {
    setCity(''); setMinCapacity(''); setMinArea(''); setDate('')
    setTimeout(fetchVenues, 0)
  }

  const hasFilters = city || minCapacity || minArea || date

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>Browse Venues</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: C.textMuted }}>
            Search and discover available event spaces
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end'
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
            <input
              value={city} onChange={e => setCity(e.target.value)}
              placeholder="e.g. Cairo"
              style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, minWidth: 150, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min. Capacity</label>
            <input
              type="number" min="0" value={minCapacity} onChange={e => setMinCapacity(e.target.value)}
              placeholder="e.g. 100"
              style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, minWidth: 130, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min. Size (m²)</label>
            <input
              type="number" min="0" value={minArea} onChange={e => setMinArea(e.target.value)}
              placeholder="e.g. 200"
              style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, minWidth: 130, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available On</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, outline: 'none' }}
            />
          </div>

          <button
            onClick={fetchVenues}
            style={{
              padding: '0.5rem 1.2rem', background: C.accent, color: C.white,
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', alignSelf: 'flex-end'
            }}
          >
            Search
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                padding: '0.5rem 0.9rem', background: C.cream, color: C.textMuted,
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13,
                cursor: 'pointer', alignSelf: 'flex-end'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Results summary */}
        {!loading && (
          <p style={{ margin: '0 0 1rem', fontSize: 13, color: C.textMuted }}>
            {venues.length === 0 ? 'No venues found.' : `${venues.length} venue${venues.length !== 1 ? 's' : ''} found${date ? ' — available on selected date' : ''}`}
          </p>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: C.textMuted }}>Loading venues...</div>
        )}

        {/* Venue cards */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {venues.map(venue => (
              <div
                key={venue.id}
                onClick={() => setSelectedVenue(venue)}
                style={{
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,45,14,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Venue icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: C.accentLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
                  }}>🏛</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{venue.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>📍 {venue.location}, {venue.city}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', background: C.accentLight, borderRadius: 20, fontSize: 12, color: C.accent, fontWeight: 600 }}>
                    👥 {venue.capacity} guests
                  </span>
                  {venue.areaM2 && (
                    <span style={{ padding: '3px 10px', background: C.cream, borderRadius: 20, fontSize: 12, color: C.textMuted, fontWeight: 600, border: `1px solid ${C.border}` }}>
                      📐 {venue.areaM2} m²
                    </span>
                  )}
                </div>

                {venue.description && (
                  <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
                    {venue.description.length > 90 ? venue.description.slice(0, 90) + '…' : venue.description}
                  </p>
                )}

                {venue.amenities && (
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    ✨ {venue.amenities}
                  </div>
                )}

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
                    EGP {Number(venue.pricePerDay || 0).toLocaleString()}
                    <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}> / day</span>
                  </div>
                  <button
                    onClick={() => navigate(`/organizer/bookings/new?venueId=${venue.id}`)}
                    style={{
                      padding: '0.45rem 1rem', background: C.accent, color: C.white,
                      border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Venue detail modal */}
      {selectedVenue && (
        <div
          onClick={() => setSelectedVenue(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.white, borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
          >
            {/* Photo gallery */}
            {selectedVenue.photos?.filter(p => p).length > 0 ? (
              <div style={{ display: 'flex', gap: 4, height: 220, overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                {selectedVenue.photos.filter(p => p).slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt="" style={{ flex: 1, objectFit: 'cover', minWidth: 0 }} onError={e => e.target.style.display = 'none'} />
                ))}
              </div>
            ) : (
              <div style={{ height: 160, background: C.accentLight, borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🏛</div>
            )}

            <div style={{ padding: '1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>{selectedVenue.name}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: C.textMuted }}>📍 {selectedVenue.location}, {selectedVenue.city}</p>
                </div>
                <button onClick={() => setSelectedVenue(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.textMuted, lineHeight: 1 }}>✕</button>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ padding: '4px 12px', background: C.accentLight, borderRadius: 20, fontSize: 13, color: C.accent, fontWeight: 600 }}>👥 {selectedVenue.capacity} guests</span>
                {selectedVenue.areaM2 && <span style={{ padding: '4px 12px', background: C.cream, borderRadius: 20, fontSize: 13, color: C.textMuted, fontWeight: 600, border: `1px solid ${C.border}` }}>📐 {selectedVenue.areaM2} m²</span>}
                <span style={{ padding: '4px 12px', background: C.greenBg, borderRadius: 20, fontSize: 13, color: C.green, fontWeight: 600 }}>EGP {Number(selectedVenue.pricePerDay || 0).toLocaleString()} / day</span>
              </div>

              {/* Description */}
              {selectedVenue.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>About</div>
                  <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{selectedVenue.description}</p>
                </div>
              )}

              {/* Amenities */}
              {selectedVenue.amenities && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Amenities</div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedVenue.amenities.split(',').map((a, i) => (
                      <span key={i} style={{ padding: '3px 10px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, color: C.text }}>✓ {a.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Book button */}
              <button
                onClick={() => { setSelectedVenue(null); navigate(`/organizer/bookings/new?venueId=${selectedVenue.id}`) }}
                style={{ width: '100%', padding: '0.85rem', background: C.accent, color: C.white, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Book This Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
