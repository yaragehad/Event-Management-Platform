import { useEffect, useState } from 'react'
import OrganizerLayout from './OrganizerLayout'
import { getBookings } from '../../services/venueService'

const ORGANIZER_ID = 1

export default function OrganizerBookingStatusPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function loadBookings() {
      try {
        // Temporary organizer ID until auth is implemented.
        const res = await getBookings({ organizerId: ORGANIZER_ID })
        setBookings(res.data)
      } catch (error) {
        console.error(error)
        alert('Failed to load booking requests.')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  const filtered = statusFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter)

  return (
    <OrganizerLayout
      title="My Booking Requests"
      subtitle="Track booking status across your submitted requests."
    >
      <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'DECLINED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: statusFilter === status ? '1px solid #2d4f8b' : '1px solid #dbe3ef',
              background: statusFilter === status ? '#e6eefc' : '#ffffff',
              color: '#2a3b53',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? <p>Loading bookings...</p> : null}
      {!loading && filtered.length === 0 ? <p>No booking requests found for this filter.</p> : null}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {filtered.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: '1px solid #dbe3ef',
              borderRadius: '10px',
              padding: '0.9rem',
              background: '#ffffff'
            }}
          >
            <h4 style={{ margin: 0, marginBottom: '0.35rem' }}>
              {booking.venue?.name || `Venue #${booking.venueId}`}
            </h4>
            <p style={{ margin: '0.2rem 0', color: '#5f6f87' }}>
              Event Date: {new Date(booking.eventDate).toLocaleDateString()}
            </p>
            <p style={{ margin: '0.2rem 0', color: '#5f6f87' }}>
              Status: <strong>{booking.status}</strong>
            </p>
            {booking.notes ? (
              <p style={{ margin: '0.2rem 0', color: '#5f6f87' }}>Notes: {booking.notes}</p>
            ) : null}
          </div>
        ))}
      </div>
    </OrganizerLayout>
  )
}
