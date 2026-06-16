import { useEffect, useState } from 'react'
import OrganizerLayout from './OrganizerLayout'
import { getBookings } from '../../services/venueService'

const ORGANIZER_ID = 1

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  accent: '#C4622D',
  accentLight: '#F5EDE8',
  cream: '#FBF7F4',
  border: '#EDE0D9',
  text: '#2C1810',
  textMuted: '#8B6555',
  white: '#FFFFFF',
  green: '#2D7A4F',
  greenBg: '#E8F5EE',
  red: '#C0392B',
  redBg: '#FDECEA',
  sidebar: '#6B2D0E',
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    PENDING:  ['#FFF8E1', '#B45309'],
    APPROVED: [C.greenBg, C.green],
    DECLINED: [C.redBg, C.red],
  }
  const [bg, color] = map[status] || ['#F3F4F6', '#6B7280']
  const icons = { PENDING: '⏳', APPROVED: '✅', DECLINED: '❌' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 12px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, background: bg, color,
    }}>
      {icons[status] || ''} {status}
    </span>
  )
}

// ─── Filter pill button ───────────────────────────────────────────────────────
function FilterPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px', borderRadius: 999,
        border: active ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
        background: active ? C.accentLight : C.white,
        color: active ? C.accent : C.textMuted,
        fontWeight: active ? 700 : 500,
        fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all .15s',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? C.accent : C.border,
          color: active ? C.white : C.textMuted,
          fontSize: 11, fontWeight: 700,
          padding: '1px 7px', borderRadius: 999,
        }}>{count}</span>
      )}
    </button>
  )
}

// ─── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ booking }) {
  const [hovered, setHovered] = useState(false)

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white,
        border: `1px solid ${hovered ? C.accent : C.border}`,
        borderRadius: 14,
        padding: '18px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
        boxShadow: hovered
          ? '0 6px 22px rgba(196,98,45,0.12)'
          : '0 2px 8px rgba(107,45,14,0.05)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Left: venue icon + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: C.accentLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>🏛️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
            {booking.venue?.name || `Venue #${booking.venueId}`}
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span>📆 {fmt(booking.eventDate)}</span>
            {booking.venue?.city && <span>📍 {booking.venue.city}</span>}
          </div>
          {booking.notes && (
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5, fontStyle: 'italic' }}>
              "{booking.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Right: status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {statusBadge(booking.status)}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  const filtered = statusFilter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === statusFilter)

  const countFor = (s) => s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length

  return (
    <OrganizerLayout
      title="My Booking Requests"
      subtitle="Track the status of all your submitted venue booking requests."
    >
      {/* ── Section header ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📋</span> Booking Requests
          </h2>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, marginTop: 10, borderRadius: 2 }} />
      </div>

      {/* ── Filter pills ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'DECLINED'].map(status => (
          <FilterPill
            key={status}
            label={status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            active={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            count={countFor(status)}
          />
        ))}
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <p style={{ margin: 0, fontSize: 14 }}>Loading booking requests...</p>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
          <p style={{ margin: 0, fontSize: 15 }}>
            {statusFilter === 'ALL' ? 'No booking requests yet.' : `No ${statusFilter.toLowerCase()} requests found.`}
          </p>
        </div>
      )}

      {/* ── Booking list ─────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </OrganizerLayout>
  )
}
