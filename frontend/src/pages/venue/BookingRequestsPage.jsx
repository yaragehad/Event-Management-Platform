import { useEffect, useState } from 'react'
import VenueLayout, { COLORS } from './VenueLayout'
import { getBookings, updateBookingStatus } from '../../services/venueService'

function Badge({ status }) {
  const map = {
    PENDING: { bg: '#FEF9C3', color: '#92400E', label: '⏳ Pending' },
    APPROVED: { bg: COLORS.greenBg, color: COLORS.green, label: '✓ Approved' },
    DECLINED: { bg: COLORS.redBg, color: COLORS.red, label: '✕ Declined' },
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

  useEffect(() => {
    getBookings({}).then(res => {
      setBookings(res.data)
      setLoading(false)
    })
  }, [])

  const handleStatus = async (id, status) => {
    await updateBookingStatus(id, status)
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
  }

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    DECLINED: bookings.filter(b => b.status === 'DECLINED').length,
  }

  return (
    <VenueLayout title="Booking Requests">

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'PENDING', 'APPROVED', 'DECLINED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '8px', border: `1px solid ${filter === f ? COLORS.accent : COLORS.border}`,
              background: filter === f ? COLORS.accentLight : COLORS.white,
              color: filter === f ? COLORS.accent : COLORS.textMuted,
              cursor: 'pointer', fontSize: '14px', fontWeight: filter === f ? '700' : '400'
            }}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>Loading bookings...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', background: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: COLORS.text }}>No booking requests</h3>
          <p style={{ color: COLORS.textMuted }}>When organizers book your venues, requests will appear here.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(booking => (
          <div key={booking.id} style={{
            background: COLORS.white, border: `1px solid ${COLORS.border}`,
            borderRadius: '12px', padding: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '48px', height: '48px', background: COLORS.accentLight,
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
              }}>📅</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: COLORS.text, marginBottom: '0.3rem' }}>
                  {booking.venue?.name || `Venue #${booking.venueId}`}
                </div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '0.2rem' }}>
                  Requested by: {booking.organizer?.name || `Organizer #${booking.organizerId}`}
                </div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
                  📆 Event Date: {new Date(booking.eventDate).toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {booking.notes && (
                  <div style={{ fontSize: '13px', color: COLORS.textMuted, marginTop: '0.25rem', fontStyle: 'italic' }}>
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
                    style={{ padding: '0.5rem 1.1rem', background: COLORS.greenBg, border: `1px solid ${COLORS.green}`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: COLORS.green, fontWeight: '600' }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleStatus(booking.id, 'DECLINED')}
                    style={{ padding: '0.5rem 1.1rem', background: COLORS.redBg, border: `1px solid ${COLORS.red}`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', color: COLORS.red, fontWeight: '600' }}
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