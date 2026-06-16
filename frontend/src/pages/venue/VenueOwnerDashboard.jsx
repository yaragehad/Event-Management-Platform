import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { AuthContext } from '../../context/AuthContext'
import { getAllVenues, getBookings } from '../../services/venueService'

function StatCard({ icon, value, label, sub, trend, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.white, border: `1px solid ${COLORS.border}`,
        borderRadius: '12px', padding: '1.25rem 1.5rem', flex: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,45,14,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{
          width: '40px', height: '40px', background: COLORS.accentLight,
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
        }}>{icon}</div>
        {trend && <span style={{ color: COLORS.green, fontSize: '13px', fontWeight: '600' }}>↗ {trend}</span>}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.text, marginBottom: '0.2rem' }}>{value}</div>
      <div style={{ fontSize: '14px', color: COLORS.textMuted }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '0.2rem' }}>{sub}</div>}
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

  const quickActions = [
    { icon: '+', label: 'New Listing', path: '/venue/create' },
    { icon: '🏛', label: 'Manage Venues', path: '/venue/listings' },
    { icon: '📅', label: 'Set Availability', path: '/venue/listings' },
    { icon: '📋', label: 'View Bookings', path: '/venue/bookings' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

  return (
    <VenueLayout title="Dashboard">

      {/* Welcome banner */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.sidebar} 0%, ${COLORS.accent} 100%)`,
        borderRadius: 16, padding: '24px 28px', marginBottom: 28, color: COLORS.white,
        boxShadow: '0 4px 20px rgba(107,45,14,0.25)',
      }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          Good {greeting}, {user?.name?.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>🏛 <strong>{venues.filter(v => v.isActive).length}</strong> active venues</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>✓ <strong>{approved}</strong> confirmed bookings</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>⏳ <strong>{pending}</strong> pending requests</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="🏛" value={venues.filter(v => v.isActive).length} label="Active listings" trend="+1 this month" onClick={() => navigate('/venue/listings')} />
        <StatCard icon="📅" value={bookings.length} label="Total bookings" trend="+12%" onClick={() => navigate('/venue/bookings')} />
        <StatCard icon="💰" value={`EGP ${revenue.toLocaleString()}`} label="Est. revenue" sub="Based on confirmed bookings" trend="+8%" onClick={() => navigate('/venue/analytics')} />
        <StatCard icon="⭐" value={pending} label="Pending requests" sub="Awaiting your response" onClick={() => navigate('/venue/bookings')} />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.border}`,
        borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '16px', fontWeight: '700', color: COLORS.text }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              style={{
                flex: 1, padding: '1rem', background: COLORS.cream,
                border: `1px solid ${COLORS.border}`, borderRadius: '10px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.5rem', fontSize: '13px',
                fontWeight: '500', color: COLORS.text, transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.accentLight; e.currentTarget.style.borderColor = COLORS.accent }}
              onMouseLeave={e => { e.currentTarget.style.background = COLORS.cream; e.currentTarget.style.borderColor = COLORS.border }}
            >
              <span style={{ fontSize: '22px' }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Your Venues */}
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.border}`,
        borderRadius: '12px', padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: COLORS.text }}>Your Venues</h2>
          <button
            onClick={() => navigate('/venue/listings')}
            style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            View all →
          </button>
        </div>

        {venues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: COLORS.textMuted }}>
            <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>🏛</div>
            <p>No venues yet. Create your first listing.</p>
            <button
              onClick={() => navigate('/venue/create')}
              style={{ padding: '0.6rem 1.2rem', background: COLORS.accent, color: COLORS.white, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              + New Listing
            </button>
          </div>
        )}

        {venues.slice(0, 5).map(venue => (
          <div key={venue.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 0', borderBottom: `1px solid ${COLORS.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '42px', height: '42px', background: COLORS.accentLight,
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
              }}>🏛</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: COLORS.text }}>{venue.name}</div>
                <div style={{ fontSize: '13px', color: COLORS.textMuted }}>{venue.location}, {venue.city}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontWeight: '600', color: COLORS.text }}>EGP {venue.pricePerDay}/day</div>
              <span style={{
                padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                background: venue.isActive ? COLORS.greenBg : COLORS.redBg,
                color: venue.isActive ? COLORS.green : COLORS.red
              }}>
                {venue.isActive ? '● Active' : '● Inactive'}
              </span>
              <button
                onClick={() => navigate(`/venue/edit/${venue.id}`)}
                style={{ padding: '0.4rem 0.8rem', background: COLORS.cream, border: `1px solid ${COLORS.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: COLORS.text }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </VenueLayout>
  )
}