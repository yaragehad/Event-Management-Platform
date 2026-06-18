import React, { useState, useEffect, useContext } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const C = {
  sidebar: '#1b0f06',
  accent: '#ff5a2c',
  accentLight: '#ffe7dc',
  cream: '#fdf4e9',
  border: '#f0e3d2',
  text: '#241407',
  textMuted: '#8a7a68',
  white: '#ffffff',
  green: '#0f7a44',
  greenBg: '#e7f7ee',
  red: '#c83e16',
  redBg: '#ffe7dc',
}

const API = 'http://localhost:3001'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 14,
      boxShadow: '0 2px 8px rgba(107,45,14,0.06)', transition: 'transform .15s, box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(107,45,14,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,45,14,0.06)' }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: accent || C.accentLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

function SectionHeader({ title, icon }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </h2>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, marginTop: 10, borderRadius: 2 }} />
    </div>
  )
}

function statusBadge(status) {
  const map = {
    ATTENDING:     [C.greenBg,    C.green,  'Attending'],
    NOT_ATTENDING: [C.redBg,      C.red,    'Not Attending'],
    MAYBE:         ['#FFF8E1', '#B45309',   'Maybe'],
    PENDING:       ['#F3F4F6', '#6B7280',   'Not responded'],
  }
  const [bg, color, label] = map[status] || map.PENDING
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: bg, color }}>
      {label}
    </span>
  )
}

const NAV_ITEMS = [
  { icon: '🎟️', label: 'My Events' },
]

function MyEventsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [guestId, setGuestId] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { if (user?.id) loadData() }, [user])

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/api/guests/by-user/${user.id}`)
      const guest = await res.json()
      if (guest.user?.name) setGuestName(guest.user.name)
      setGuestId(guest.id)
      setEvents(guest.events || [])
      setRsvps(guest.rsvps || [])
    } catch (err) {
      console.error('Failed to load events')
    }
    setLoading(false)
  }

  const statusFor = (eventId) => {
    const rsvp = rsvps.find(r => r.eventId === eventId)
    return rsvp ? rsvp.status : 'PENDING'
  }

  const attendingCount = events.filter(e => statusFor(e.id) === 'ATTENDING').length
  const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
        <p style={{ color: C.textMuted }}>Loading your events...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: 220, background: C.sidebar, color: C.white, padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '0 20px 20px', borderBottom: `1px solid rgba(255,255,255,0.1)`, marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.white }}>VenueHub</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Guest Portal</div>
          </div>
          {NAV_ITEMS.map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', cursor: 'pointer', borderRadius: 0,
              background: 'rgba(255,255,255,0.15)',
              color: C.white, fontWeight: 600, fontSize: 14,
            }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* Top bar */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.text, lineHeight: 1 }}
          >☰</button>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 16 }}>Guest Portal</span>
        </div>

        <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

          {/* Welcome banner */}
          <div style={{
            background: `linear-gradient(135deg, ${C.sidebar} 0%, ${C.accent} 100%)`,
            borderRadius: 16, padding: '24px 28px', marginBottom: 28, color: C.white,
            boxShadow: '0 4px 20px rgba(107,45,14,0.25)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              Good {greeting}, {guestName?.split(' ')[0] || 'Guest'} 👋
            </div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14, opacity: 0.9 }}>🎟️ <strong>{events.length}</strong> event{events.length !== 1 ? 's' : ''} invited to</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>✅ <strong>{attendingCount}</strong> attending</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>📅 <strong>{upcomingCount}</strong> upcoming</div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
            <StatCard icon="🎟️" label="Events Invited To" value={events.length} />
            <StatCard icon="✅" label="Attending" value={attendingCount} accent={C.greenBg} />
            <StatCard icon="📅" label="Upcoming" value={upcomingCount} accent={C.accentLight} />
            <StatCard icon="⏳" label="Awaiting Response" value={events.filter(e => statusFor(e.id) === 'PENDING').length} accent="#FFF8E1" />
          </div>

          {/* Events section */}
          <SectionHeader title="My Events" icon="🎉" />

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
              <p style={{ margin: 0, fontSize: 14 }}>You're not invited to any events yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/guest-dashboard/${event.id}?guestId=${guestId}`)}
                  style={{
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(107,45,14,0.06)', transition: 'transform .15s, box-shadow .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(107,45,14,0.14)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,45,14,0.06)' }}
                >
                  <div style={{ background: `linear-gradient(135deg, ${C.sidebar} 0%, ${C.accent} 100%)`, padding: '20px 22px' }}>
                    <h3 style={{ color: C.white, margin: 0, fontSize: 17, fontWeight: 700 }}>{event.name}</h3>
                  </div>
                  <div style={{ padding: '18px 22px' }}>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>📆 {fmt(event.date)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {statusBadge(statusFor(event.id))}
                      <span style={{ color: C.accent, fontSize: 13, fontWeight: 700 }}>Open →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default MyEventsPage
