import { useEffect, useState, useContext, useMemo } from 'react'
import VenueLayout, { COLORS } from './VenueLayout'
import { AuthContext } from '../../context/AuthContext'
import { getBookings, getAllVenues } from '../../services/venueService'

const STATUS_MAP = {
  PENDING:  { bg: '#FEF9C3', color: '#92400E', label: '⏳ Pending' },
  APPROVED: { bg: COLORS.greenBg, color: COLORS.green, label: '✓ Approved' },
  DECLINED: { bg: COLORS.redBg,  color: COLORS.red,   label: '✕ Declined' },
}

function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING
  return (
    <span style={{ padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ bookings, month, year, onPrev, onNext }) {
  const bookedDates = new Set(
    bookings.map(b => new Date(b.eventDate).toDateString())
  )
  const approvedDates = new Set(
    bookings.filter(b => b.status === 'APPROVED').map(b => new Date(b.eventDate).toDateString())
  )

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toDateString()
  const monthName = new Date(year, month).toLocaleString('en', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '1.25rem', minWidth: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={onPrev} style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: COLORS.text }}>‹</button>
        <span style={{ fontWeight: '700', fontSize: '15px', color: COLORS.text }}>{monthName}</span>
        <button onClick={onNext} style={{ background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: COLORS.text }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ fontSize: '11px', fontWeight: '700', color: COLORS.textMuted, padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />
          const dateStr = new Date(year, month, d).toDateString()
          const isToday = dateStr === today
          const isApproved = approvedDates.has(dateStr)
          const isBooked = bookedDates.has(dateStr)
          return (
            <div key={d} style={{
              padding: '6px 2px', borderRadius: '6px', fontSize: '13px', fontWeight: isBooked ? '700' : '400',
              background: isApproved ? COLORS.green : isBooked ? '#FEF9C3' : 'transparent',
              color: isApproved ? COLORS.white : isToday ? COLORS.accent : COLORS.text,
              border: isToday ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              cursor: isBooked ? 'default' : 'default',
              position: 'relative',
            }}>
              {d}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: COLORS.textMuted }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.green, display: 'inline-block' }} /> Confirmed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: COLORS.textMuted }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEF9C3', border: '1px solid #92400E', display: 'inline-block' }} /> Pending
        </div>
      </div>
    </div>
  )
}

// ─── Organizer Contact Card ────────────────────────────────────────────────────
function OrganizerCard({ organizer }) {
  const initials = organizer?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div style={{
      marginTop: '0.75rem', padding: '0.75rem 1rem',
      background: COLORS.accentLight, borderRadius: '8px',
      border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '0.75rem'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: COLORS.accent,
        color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '14px', flexShrink: 0
      }}>{initials}</div>
      <div>
        <div style={{ fontWeight: '600', fontSize: '13px', color: COLORS.text }}>{organizer?.name || '—'}</div>
        <a href={`mailto:${organizer?.email}`} style={{ fontSize: '12px', color: COLORS.accent, textDecoration: 'none' }}>
          ✉ {organizer?.email || '—'}
        </a>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingRequestsPage() {
  const { user } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [expandedId, setExpandedId] = useState(null)

  // filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [venueFilter, setVenueFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // calendar nav
  const now = new Date()
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      getBookings({ ownerId: user.id }),
      getAllVenues({ ownerId: user.id }),
    ]).then(([bRes, vRes]) => {
      setBookings(bRes.data)
      setVenues(vRes.data)
    }).finally(() => setLoading(false))
  }, [user?.id])

  // EMP-140: upcoming confirmed bookings in next 7 days
  const reminders = useMemo(() => {
    const now = new Date()
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return bookings.filter(b => {
      const d = new Date(b.eventDate)
      return b.status === 'APPROVED' && d >= now && d <= in7
    })
  }, [bookings])

  // EMP-138: client-side filters
  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false
      if (venueFilter && b.venueId !== parseInt(venueFilter)) return false
      if (dateFrom && new Date(b.eventDate) < new Date(dateFrom)) return false
      if (dateTo && new Date(b.eventDate) > new Date(dateTo)) return false
      return true
    })
  }, [bookings, statusFilter, venueFilter, dateFrom, dateTo])

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    DECLINED: bookings.filter(b => b.status === 'DECLINED').length,
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  return (
    <VenueLayout title="Confirmed Bookings">

      {/* EMP-140: Reminders banner */}
      {reminders.length > 0 && (
        <div style={{
          background: '#FEF9C3', border: '1px solid #F59E0B', borderRadius: '10px',
          padding: '0.9rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
        }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#92400E', marginBottom: '0.35rem' }}>
              Upcoming in the next 7 days
            </div>
            {reminders.map(b => (
              <div key={b.id} style={{ fontSize: '13px', color: '#78350F', marginBottom: '2px' }}>
                • <strong>{b.venue?.name}</strong> — {new Date(b.eventDate).toLocaleDateString('en-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' '}(booked by {b.organizer?.name})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMP-138: Filters */}
      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'APPROVED', 'PENDING', 'DECLINED'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: '0.4rem 0.9rem', borderRadius: '7px', border: `1px solid ${statusFilter === f ? COLORS.accent : COLORS.border}`,
                background: statusFilter === f ? COLORS.accentLight : COLORS.cream,
                color: statusFilter === f ? COLORS.accent : COLORS.textMuted,
                cursor: 'pointer', fontSize: '13px', fontWeight: statusFilter === f ? '700' : '400'
              }}>
                {f} ({counts[f] ?? 0})
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '28px', background: COLORS.border }} />

          {/* Venue filter */}
          <select
            value={venueFilter}
            onChange={e => setVenueFilter(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: `1px solid ${COLORS.border}`, fontSize: '13px', color: COLORS.text, background: COLORS.white, cursor: 'pointer' }}
          >
            <option value="">All Venues</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>

          {/* Date range */}
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: '0.4rem 0.7rem', borderRadius: '7px', border: `1px solid ${COLORS.border}`, fontSize: '13px', color: COLORS.text }} />
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: '0.4rem 0.7rem', borderRadius: '7px', border: `1px solid ${COLORS.border}`, fontSize: '13px', color: COLORS.text }} />

          {(venueFilter || dateFrom || dateTo || statusFilter !== 'ALL') && (
            <button onClick={() => { setStatusFilter('ALL'); setVenueFilter(''); setDateFrom(''); setDateTo('') }}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: `1px solid ${COLORS.red}`, background: COLORS.redBg, color: COLORS.red, cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              ✕ Clear
            </button>
          )}

          {/* View toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
            {[['list', '☰ List'], ['calendar', '📅 Calendar']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '0.4rem 0.85rem', borderRadius: '7px', fontSize: '13px', fontWeight: view === v ? '700' : '400',
                border: `1px solid ${view === v ? COLORS.accent : COLORS.border}`,
                background: view === v ? COLORS.accentLight : COLORS.cream,
                color: view === v ? COLORS.accent : COLORS.textMuted, cursor: 'pointer'
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>Loading bookings...</div>}

      {!loading && (
        view === 'calendar' ? (
          /* EMP-137: Calendar view */
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <MiniCalendar bookings={filtered} month={calMonth} year={calYear} onPrev={prevMonth} onNext={nextMonth} />
            <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '13px', color: COLORS.textMuted }}>
                Showing {filtered.length} booking{filtered.length !== 1 ? 's' : ''} for {new Date(calYear, calMonth).toLocaleString('en', { month: 'long', year: 'numeric' })}
              </p>
              {filtered.filter(b => {
                const d = new Date(b.eventDate)
                return d.getMonth() === calMonth && d.getFullYear() === calYear
              }).map(b => <BookingCard key={b.id} booking={b} expandedId={expandedId} setExpandedId={setExpandedId} />)}
            </div>
          </div>
        ) : (
          /* EMP-137: List view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ color: COLORS.text, margin: '0 0 0.5rem' }}>No bookings found</h3>
                <p style={{ color: COLORS.textMuted, margin: 0 }}>Try adjusting your filters.</p>
              </div>
            )}
            {filtered.map(b => <BookingCard key={b.id} booking={b} expandedId={expandedId} setExpandedId={setExpandedId} />)}
          </div>
        )
      )}
    </VenueLayout>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking: b, expandedId, setExpandedId }) {
  const isExpanded = expandedId === b.id
  return (
    <div style={{
      background: COLORS.white, border: `1px solid ${COLORS.border}`,
      borderRadius: '12px', padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '44px', height: '44px', background: COLORS.accentLight,
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0
          }}>📅</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: COLORS.text, marginBottom: '0.2rem' }}>
              {b.venue?.name || `Venue #${b.venueId}`}
            </div>
            <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '0.15rem' }}>
              Organizer: <strong>{b.organizer?.name || `#${b.organizerId}`}</strong>
            </div>
            <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
              📆 {new Date(b.eventDate).toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {b.notes && (
              <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '0.2rem', fontStyle: 'italic' }}>
                Note: {b.notes}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <Badge status={b.status} />
          {/* EMP-139: toggle organizer contact */}
          <button
            onClick={() => setExpandedId(isExpanded ? null : b.id)}
            style={{
              padding: '0.4rem 0.85rem', borderRadius: '7px', fontSize: '12px', fontWeight: '600',
              border: `1px solid ${COLORS.border}`, background: isExpanded ? COLORS.accentLight : COLORS.cream,
              color: isExpanded ? COLORS.accent : COLORS.textMuted, cursor: 'pointer'
            }}
          >
            {isExpanded ? '▲ Hide Contact' : '👤 Contact'}
          </button>
        </div>
      </div>

      {/* EMP-139: Organizer contact card */}
      {isExpanded && <OrganizerCard organizer={b.organizer} />}
    </div>
  )
}
