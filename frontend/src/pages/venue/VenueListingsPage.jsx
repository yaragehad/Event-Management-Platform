import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { getAllVenues, deleteVenue } from '../../services/venueService'

export default function VenueListingsPage() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('')
  const navigate = useNavigate()

  const fetchVenues = async () => {
    setLoading(true)
    const filters = {}
    if (cityFilter) filters.city = cityFilter
    if (capacityFilter) filters.minCapacity = capacityFilter
    const res = await getAllVenues(filters)
    setVenues(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchVenues() }, [])

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this venue?')) return
    await deleteVenue(id)
    setVenues(venues.filter(v => v.id !== id))
  }

  const inputStyle = {
    padding: '0.6rem 1rem', border: `1px solid ${COLORS.border}`,
    borderRadius: '8px', fontSize: '14px', background: COLORS.white,
    color: COLORS.text, outline: 'none'
  }

  return (
    <VenueLayout title="My Venues">

      {/* Filters + Add button */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          placeholder="Filter by city..."
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          placeholder="Min capacity"
          type="number"
          value={capacityFilter}
          onChange={e => setCapacityFilter(e.target.value)}
          style={{ ...inputStyle, width: '160px' }}
        />
        <button
          onClick={fetchVenues}
          style={{
            padding: '0.6rem 1.2rem', background: COLORS.text,
            color: COLORS.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
          }}
        >
          Search
        </button>
        <button
          onClick={() => navigate('/venue/create')}
          style={{
            padding: '0.6rem 1.2rem', background: COLORS.accent,
            color: COLORS.white, border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap'
          }}
        >
          + New Listing
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>Loading venues...</div>
      )}

      {!loading && venues.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem', background: COLORS.white,
          borderRadius: '12px', border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🏛</div>
          <h3 style={{ color: COLORS.text, marginBottom: '0.5rem' }}>No venues found</h3>
          <p style={{ color: COLORS.textMuted, marginBottom: '1.5rem' }}>Create your first venue listing to get started.</p>
          <button
            onClick={() => navigate('/venue/create')}
            style={{ padding: '0.75rem 1.5rem', background: COLORS.accent, color: COLORS.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Create Venue
          </button>
        </div>
      )}

      {/* Venue Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {venues.map(venue => (
          <div key={venue.id} style={{
            background: COLORS.white, border: `1px solid ${COLORS.border}`,
            borderRadius: '12px', padding: '1.25rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '52px', height: '52px', background: COLORS.accentLight,
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0
              }}>🏛</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.text, marginBottom: '0.2rem' }}>{venue.name}</div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '0.4rem' }}>{venue.location}, {venue.city}</div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '13px', color: COLORS.textMuted }}>
                  <span>👥 Capacity: {venue.capacity}</span>
                  <span>📐 {venue.areaM2 ? `${venue.areaM2}m²` : 'N/A'}</span>
                  {venue.amenities && <span>✨ {venue.amenities}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.text }}>EGP {venue.pricePerDay.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>per day</div>
              </div>
              <span style={{
                padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                background: venue.isActive ? COLORS.greenBg : COLORS.redBg,
                color: venue.isActive ? COLORS.green : COLORS.red
              }}>
                {venue.isActive ? '● Active' : '● Inactive'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/venue/edit/${venue.id}`)}
                  style={{ padding: '0.5rem 1rem', background: COLORS.cream, border: `1px solid ${COLORS.border}`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: COLORS.text, fontWeight: '500' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/venue/calendar/${venue.id}`)}
                  style={{ padding: '0.5rem 1rem', background: COLORS.cream, border: `1px solid ${COLORS.border}`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: COLORS.text, fontWeight: '500' }}
                >
                  Calendar
                </button>
                <button
                  onClick={() => handleDeactivate(venue.id)}
                  style={{ padding: '0.5rem 1rem', background: COLORS.redBg, border: `1px solid #f5c6c2`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: COLORS.red, fontWeight: '500' }}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VenueLayout>
  )
}