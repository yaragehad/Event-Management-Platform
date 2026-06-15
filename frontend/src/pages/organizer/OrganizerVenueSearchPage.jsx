import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizerLayout from './OrganizerLayout'
import { getAllVenues } from '../../services/venueService'

const inputStyle = {
  padding: '0.55rem 0.7rem',
  border: '1px solid #dbe3ef',
  borderRadius: '8px',
  fontSize: '14px'
}

export default function OrganizerVenueSearchPage() {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [minCapacity, setMinCapacity] = useState('')

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (city) filters.city = city
      if (minCapacity) filters.minCapacity = minCapacity
      const res = await getAllVenues(filters)
      setVenues(res.data)
    } catch (error) {
      console.error(error)
      alert('Failed to load venues.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  return (
    <OrganizerLayout
      title="Organizer Venue Search"
      subtitle="Search active venues and create booking requests."
    >
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g. Cairo)"
          style={{ ...inputStyle, minWidth: '220px' }}
        />
        <input
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          placeholder="Minimum capacity"
          type="number"
          style={{ ...inputStyle, minWidth: '220px' }}
        />
        <button
          onClick={fetchVenues}
          style={{
            padding: '0.55rem 0.95rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            background: '#2d4f8b',
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      {loading ? <p>Loading venues...</p> : null}
      {!loading && venues.length === 0 ? <p>No venues found.</p> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem' }}>
        {venues.map((venue) => (
          <div
            key={venue.id}
            style={{
              border: '1px solid #dbe3ef',
              borderRadius: '10px',
              padding: '0.9rem',
              background: '#ffffff'
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{venue.name}</h4>
            <p style={{ margin: '0.25rem 0', color: '#5f6f87' }}>{venue.location}, {venue.city}</p>
            <p style={{ margin: '0.25rem 0', color: '#5f6f87' }}>Capacity: {venue.capacity}</p>
            <p style={{ margin: '0.25rem 0', color: '#5f6f87' }}>Price/Day: EGP {Number(venue.pricePerDay || 0).toLocaleString()}</p>

            <button
              onClick={() => navigate(`/organizer/bookings/new?venueId=${venue.id}`)}
              style={{
                marginTop: '0.55rem',
                padding: '0.5rem 0.8rem',
                border: 'none',
                borderRadius: '8px',
                background: '#0f766e',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Book This Venue
            </button>
          </div>
        ))}
      </div>
    </OrganizerLayout>
  )
}
