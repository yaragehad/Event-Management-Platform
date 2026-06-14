import { useEffect, useState } from 'react'
import VenueLayout, { COLORS } from './VenueLayout'
import { getBookings, updateBookingStatus } from '../../services/venueService'

function Badge({ status }) {
  const map = {
    PENDING: { bg: '#FEF9C3', color: '#92400E', label: '⏳ Pending' },
    APPROVED: { bg: COLORS?.greenBg || '#D1FAE5', color: COLORS?.green || '#065F46', label: '✓ Approved' },
    DECLINED: { bg: COLORS?.redBg || '#FEE2E2', color: COLORS?.red || '#991B1B', label: '✕ Declined' },
  }
  const s = map[status] || map.PENDING
  return (
    <span style={{ padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Adding error handling here
    getBookings({})
      .then(res => {
        // Handle both Axios response (res.data) or direct array return (res)
        const data = Array.isArray(res) ? res : (res?.data || [])
        setBookings(data)
      })
      .catch(err => {
        console.error("Failed to fetch bookings:", err)
        setError("Failed to load bookings. Please check your backend connection.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status)
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
    } catch (err) {
      alert("Failed to update status. Please try again.")
    }
  }

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    DECLINED: bookings.filter(b => b.status === 'DECLINED').length,
  }

  // Safe fallback if COLORS is missing in VenueLayout
  const safeColors = COLORS || {
    accent: '#3B82F6', accentLight: '#DBEAFE', white: '#FFFFFF',
    border: '#E5E7EB', text: '#1F2937', textMuted: '#6B7280'
  }

  return (
    <VenueLayout title="Booking Requests">
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'DECLINED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '8px', 
              border: `1px solid ${filter === f ? safeColors.accent : safeColors.border}`,
              background: filter === f ? safeColors.accentLight : safeColors.white,
              color: filter === f ? safeColors.accent : safeColors.textMuted,
              cursor: 'pointer', fontSize: '14px', fontWeight: filter === f ? '700' : '400',
              transition: 'all 0.2s'
            }}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: safeColors.textMuted }}>Loading bookings...</div>}
      {error && <div style={{ textAlign: 'center', padding: '1rem', color: '#991B1B', background: '#FEE2E2', borderRadius: '8px' }}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', background: safeColors.white, borderRadius: '12px', border: `1px solid ${safeColors.border}` }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: safeColors.text }}>No booking requests</h3>
          <p style={{ color: safeColors.textMuted }}>When organizers book your venues, requests will appear here.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!loading && filtered.map(booking => (
          <div key={booking.id} style={{
            background: safeColors.white, border: `1px solid ${safeColors.border}`,
            borderRadius: '12px', padding: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '48px', height: '48px', background: safeColors.accentLight,
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0
              }}>📅</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: safeColors.text, marginBottom: '0.3rem' }}>
                  {booking.venue?.name || `Venue ID #${booking.venueId}`}
                </div>
                <div style={{ fontSize: '13px', color: safeColors.textMuted, marginBottom: '0.2rem' }}>
                  Requested by: {booking.organizer?.name || `Organizer ID #${booking.organizerId}`}
                </div>
                <div style={{ fontSize: '13px', color: safeColors.textMuted }}>
                  📆 Event Date: {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
                {booking.notes && (
                  <div style={{ fontSize: '13px', color: safeColors.textMuted, marginTop: '0.25rem', fontStyle: 'italic' }}>
                    Note: {booking.notes}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <Badge status={booking.status} />
              {booking.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleStatus(booking.id, 'APPROVED')}
                    style={{ padding: '0.5rem 1.1rem', background: '#D1FAE5', border: `1px solid #059669`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: '#065F46', fontWeight: '600' }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleStatus(booking.id, 'DECLINED')}
                    style={{ padding: '0.5rem 1.1rem', background: '#FEE2E2', border: `1px solid #DC2626`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: '#991B1B', fontWeight: '600' }}
                  >
                    ✕ Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </VenueLayout>
  )
}