import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrganizerLayout from './OrganizerLayout'
import { createBooking, getAllVenues } from '../../services/venueService'

const ORGANIZER_ID = 1

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function OrganizerCreateBookingPage() {
  const navigate = useNavigate()
  const query = useQuery()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [venueId, setVenueId] = useState(query.get('venueId') || '')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadVenues() {
      try {
        const res = await getAllVenues({})
        setVenues(res.data)
      } catch (error) {
        console.error(error)
        alert('Failed to load venues.')
      } finally {
        setLoading(false)
      }
    }

    loadVenues()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!venueId || !eventDate) {
      alert('Please select a venue and event date.')
      return
    }

    setSubmitting(true)
    try {
      // Temporary organizer ID until auth is implemented.
      await createBooking({ venueId: Number(venueId), organizerId: ORGANIZER_ID, eventDate, notes })
      alert('Booking request submitted successfully.')
      navigate('/organizer/bookings')
    } catch (error) {
      console.error(error)
      alert('Failed to submit booking request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OrganizerLayout
      title="Create Booking Request"
      subtitle="Submit a new booking request for a selected venue."
    >
      {loading ? (
        <p>Loading form data...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem', maxWidth: '540px' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Venue</span>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #dbe3ef' }}
            >
              <option value="">Select a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Event Date</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #dbe3ef' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #dbe3ef', resize: 'vertical' }}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              background: submitting ? '#8da4ca' : '#2d4f8b',
              color: '#ffffff',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>
      )}
    </OrganizerLayout>
  )
}
