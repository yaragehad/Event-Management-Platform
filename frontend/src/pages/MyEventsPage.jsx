import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const C = {
  sidebar: '#6B2D0E',
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
}

const API = 'http://localhost:3001'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'

function badge(label, bg, color) {
  return <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: bg, color }}>{label}</span>
}

function statusBadge(status) {
  const map = {
    ATTENDING: [C.greenBg, C.green, 'Attending'],
    NOT_ATTENDING: [C.redBg, C.red, 'Not Attending'],
    MAYBE: ['#FFF8E1', '#B45309', 'Maybe'],
    PENDING: ['#F3F4F6', '#6B7280', 'Not responded'],
  }
  const [bg, color, label] = map[status] || map.PENDING
  return badge(label, bg, color)
}

function MyEventsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const guestId = parseInt(searchParams.get('guestId')) || 1

  const [guestName, setGuestName] = useState('')
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/api/guests/${guestId}`)
      const guest = await res.json()
      if (guest.user?.name) setGuestName(guest.user.name)
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

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <p style={{ color: C.textMuted }}>Loading your events...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Welcome banner — matches organizer dashboard */}
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
            <div style={{ fontSize: 14, opacity: 0.9 }}>🎟️ <strong>{events.length}</strong> event{events.length !== 1 ? 's' : ''} you're invited to</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>✅ <strong>{rsvps.filter(r => r.status === 'ATTENDING').length}</strong> attending</div>
          </div>
        </div>

        {/* Section header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎉</span> My Events
          </h2>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, marginTop: 10, borderRadius: 2 }} />
        </div>

        {/* Empty state */}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
            <p style={{ margin: 0, fontSize: 14 }}>You're not invited to any events yet.</p>
          </div>
        )}

        {/* Event cards */}
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
                <h3 style={{ color: C.white, margin: 0, fontSize: 18, fontWeight: 700 }}>{event.name}</h3>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>📆 {fmt(event.date)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {statusBadge(statusFor(event.id))}
                  <span style={{ color: C.accent, fontSize: 14, fontWeight: 700 }}>Open →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default MyEventsPage