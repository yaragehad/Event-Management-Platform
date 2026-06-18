import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { AuthContext } from '../../context/AuthContext'
import { getAllVenues, getBookings } from '../../services/venueService'

const bricolage = "'Bricolage Grotesque', system-ui, sans-serif"

function KpiCard({ icon, iconBg, value, label, trend, trendBg, trendColor, dark, chip, chipBg, chipColor, progress, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: dark ? COLORS.sidebar : COLORS.white,
        border: `1px solid ${dark ? 'transparent' : COLORS.border}`,
        borderRadius: 20, padding: 20, flex: 1, minWidth: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(27,15,6,0.12)' } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: dark ? 'rgba(255,90,44,0.22)' : (iconBg || COLORS.accentLight),
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
        }}>{icon}</div>
        {trend && (
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 8, background: trendBg || COLORS.greenBg, color: trendColor || COLORS.green }}>
            {trend}
          </span>
        )}
        {chip && (
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 8, background: chipBg || COLORS.goldBg, color: chipColor || COLORS.goldText }}>
            {chip}
          </span>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: dark ? '#ffffff' : COLORS.text, fontFamily: bricolage, marginBottom: 4, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13.5, color: dark ? '#a8917f' : COLORS.textMuted }}>{label}</div>
      {progress != null && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 4, background: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: COLORS.greenFill, borderRadius: 4 }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function VenueOwnerDashboard() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!user?.id) return
    getAllVenues({ ownerId: user.id }).then(res => setVenues(res.data)).catch(() => {})
    getBookings({ ownerId: user.id }).then(res => setBookings(res.data)).catch(() => {})
  }, [user?.id])

  const pending = bookings.filter(b => b.status === 'PENDING').length
  const approved = bookings.filter(b => b.status === 'APPROVED').length
  const revenue = venues.reduce((sum, v) => sum + (v.pricePerDay * approved), 0)
  const occupancyPct = venues.length ? Math.min(100, Math.round((approved / Math.max(venues.length * 4, 1)) * 100)) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

  const quickActions = [
    { icon: '+', label: 'New Listing', path: '/venue/create' },
    { icon: '🏛', label: 'Manage Venues', path: '/venue/listings' },
    { icon: '📅', label: 'Set Availability', path: '/venue/listings' },
    { icon: '📋', label: 'View Bookings', path: '/venue/bookings' },
  ]

  return (
    <VenueLayout title="Dashboard">

      {/* Welcome */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: bricolage, color: COLORS.text }}>
          Good {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
        </div>
        <div style={{ fontSize: 13.5, color: COLORS.textMuted, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}
          <span>{venues.filter(v => v.isActive).length} active venues</span>
          {' · '}
          <span style={{ color: COLORS.green }}>{approved} confirmed</span>
          {' · '}
          <span style={{ color: COLORS.accent }}>{pending} pending</span>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <KpiCard
          icon="$"
          iconBg={COLORS.accentLight}
          value={`EGP ${revenue.toLocaleString()}`}
          label="Est. revenue"
          trend="+12%"
          trendBg={COLORS.greenBg}
          trendColor={COLORS.green}
          onClick={() => navigate('/venue/analytics')}
        />
        <KpiCard
          icon="🏛"
          iconBg={COLORS.goldBg}
          value={venues.filter(v => v.isActive).length}
          label="Active listings"
          chip="Total"
          chipBg={COLORS.goldBg}
          chipColor={COLORS.goldText}
          onClick={() => navigate('/venue/listings')}
        />
        <KpiCard
          icon="✓"
          iconBg={COLORS.greenBg}
          value={approved}
          label="Confirmed bookings"
          progress={occupancyPct}
          onClick={() => navigate('/venue/bookings')}
        />
        <KpiCard
          icon="⏳"
          value={pending}
          label="Pending requests"
          dark
          onClick={() => navigate('/venue/bookings')}
        />
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Quick Actions */}
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: 20 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: COLORS.text, fontFamily: bricolage }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  style={{
                    padding: '14px 8px', background: COLORS.cream,
                    border: `1px solid ${COLORS.border}`, borderRadius: 13,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6, fontSize: 13,
                    fontWeight: 600, color: COLORS.text, transition: 'all 0.15s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = COLORS.accentLight
                    e.currentTarget.style.borderColor = COLORS.accent
                    e.currentTarget.style.color = COLORS.accent
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = COLORS.cream
                    e.currentTarget.style.borderColor = COLORS.border
                    e.currentTarget.style.color = COLORS.text
                  }}
                >
                  <span style={{ fontSize: 20 }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text, fontFamily: bricolage }}>Recent Bookings</h2>
              <button
                onClick={() => navigate('/venue/bookings')}
                style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit' }}
              >
                View all →
              </button>
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: COLORS.textMuted }}>
                <div style={{
                  width: 48, height: 48, background: COLORS.greenBg, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, margin: '0 auto 10px'
                }}>✓</div>
                <p style={{ margin: 0, fontSize: 14, color: COLORS.textMuted }}>No bookings yet.</p>
              </div>
            ) : (
              bookings.slice(0, 5).map((b, i) => {
                const organizerName = b.organizer?.name || 'Organizer'
                const initials = organizerName.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
                const displayTitle = b.eventType || b.notes || `Booking #${b.id}`
                const venueName = b.venue?.name || ''
                const dateStr = b.eventDate
                  ? new Date(b.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : ''
                const guests = b.attendeeCount ? `${b.attendeeCount} guests` : ''

                return (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 8px', borderRadius: 12,
                      borderBottom: i < Math.min(bookings.length, 5) - 1 ? `1px solid ${COLORS.borderFaint}` : 'none',
                      cursor: 'pointer', transition: 'background 0.12s'
                    }}
                    onClick={() => navigate('/venue/bookings')}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.cream}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, background: COLORS.goldBg, borderRadius: 11,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: COLORS.goldText, flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{displayTitle}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                          {[venueName, dateStr, guests].filter(Boolean).join(' · ')}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 1 }}>{organizerName}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                        background: b.status === 'APPROVED' ? COLORS.greenBg
                          : b.status === 'PENDING' ? COLORS.accentLight
                          : COLORS.goldBg,
                        color: b.status === 'APPROVED' ? COLORS.green
                          : b.status === 'PENDING' ? COLORS.red
                          : COLORS.goldText
                      }}>{b.status}</span>
                      <span style={{ color: COLORS.textFaint, fontSize: 16 }}>›</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Your Venues */}
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text, fontFamily: bricolage }}>Your Venues</h2>
              <button
                onClick={() => navigate('/venue/listings')}
                style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
              >
                View all →
              </button>
            </div>

            {venues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: COLORS.textMuted }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏛</div>
                <p style={{ margin: '0 0 14px', fontSize: 13 }}>No venues yet. Create your first listing.</p>
                <button
                  onClick={() => navigate('/venue/create')}
                  style={{
                    padding: '8px 18px', background: COLORS.accent, color: '#fff',
                    border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13,
                    fontWeight: 600, boxShadow: '0 4px 12px rgba(255,90,44,.28)', fontFamily: 'inherit'
                  }}
                >
                  + New Listing
                </button>
              </div>
            ) : (
              venues.slice(0, 5).map((venue, i) => (
                <div key={venue.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < Math.min(venues.length, 5) - 1 ? `1px solid ${COLORS.borderFaint}` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: venue.isActive ? COLORS.greenFill : COLORS.textFaint
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: COLORS.text }}>{venue.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 1 }}>
                        {venue.city} · {venue.capacity} guests
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: venue.isActive ? COLORS.greenFill : COLORS.textMuted }}>
                      {venue.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => navigate(`/venue/edit/${venue.id}`)}
                      style={{
                        padding: '4px 10px', background: COLORS.cream, border: `1px solid ${COLORS.border}`,
                        borderRadius: 8, cursor: 'pointer', fontSize: 12, color: COLORS.text, fontFamily: 'inherit'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Analytics shortcut */}
          <div
            onClick={() => navigate('/venue/analytics')}
            style={{
              background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 22,
              padding: 20, cursor: 'pointer', transition: 'background 0.12s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.cream}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: bricolage }}>Analytics</h2>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>Revenue & occupancy charts</div>
              </div>
              <div style={{ width: 40, height: 40, background: COLORS.accentLight, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
            </div>
          </div>

          {/* Profile shortcut */}
          <div
            onClick={() => navigate('/venue/profile')}
            style={{
              background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 22,
              padding: 20, cursor: 'pointer', transition: 'background 0.12s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.cream}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: bricolage }}>My Profile</h2>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>Account settings & details</div>
              </div>
              <div style={{ width: 40, height: 40, background: COLORS.goldBg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
            </div>
          </div>
        </div>
      </div>
    </VenueLayout>
  )
}
