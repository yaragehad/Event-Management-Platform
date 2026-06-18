import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

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

function StatCard({ icon, label, value, accentBg, valueColor }) {
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
        width: 46, height: 46, borderRadius: 12, background: accentBg || C.accentLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: valueColor || C.text, lineHeight: 1.2 }}>{value ?? '—'}</div>
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

function GuestDashboardPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const guestId = parseInt(searchParams.get('guestId')) || 1

  const [guestName, setGuestName] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState('PENDING')
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [guestRes, eventRes] = await Promise.all([
        fetch(`${API}/api/guests/${guestId}`),
        fetch(`${API}/api/events/${eventId}`),
      ])
      const guest = await guestRes.json()
      const event = await eventRes.json()
      if (guest.user?.name) setGuestName(guest.user.name)
      const rsvp = guest.rsvps?.find(r => r.eventId === parseInt(eventId))
      if (rsvp) { setRsvpStatus(rsvp.status); setCheckedIn(!!rsvp.checkedIn) }
      if (event.name) setEventName(event.name)
      if (event.date) setEventDate(event.date)
    } catch (err) {
      console.error('Failed to load dashboard')
    }
    setLoading(false)
  }

  const qs = `?guestId=${guestId}`
  const isAttending = rsvpStatus === 'ATTENDING'
  const canFeedback = isAttending && checkedIn

  const rsvpLabel = rsvpStatus === 'ATTENDING' ? 'Attending'
    : rsvpStatus === 'NOT_ATTENDING' ? 'Not Attending'
    : rsvpStatus === 'MAYBE' ? 'Maybe' : 'Not responded'

  const rsvpColor = rsvpStatus === 'ATTENDING' ? C.green
    : rsvpStatus === 'NOT_ATTENDING' ? C.red : C.textMuted

  const rsvpBg = rsvpStatus === 'ATTENDING' ? C.greenBg
    : rsvpStatus === 'NOT_ATTENDING' ? C.redBg : '#F3F4F6'

  const actions = [
    { label: 'View Invitation', desc: 'See full event details', href: `/invitation/${eventId}${qs}`, icon: '📋', iconBg: C.accentLight },
    { label: rsvpStatus === 'PENDING' ? 'RSVP Now' : 'Update RSVP', desc: 'Confirm your attendance', href: `/rsvp/${eventId}${qs}`, icon: '✅', iconBg: C.accentLight },
    ...(isAttending ? [
      { label: 'My Check-In QR', desc: 'Show this at the entrance', href: `/my-qr/${eventId}${qs}`, icon: '📱', iconBg: C.greenBg },
      { label: 'Message Organizer', desc: 'Ask a question or get updates', href: `/guest-chat/${eventId}${qs}`, icon: '💬', iconBg: C.accentLight },
    ] : []),
    ...(canFeedback ? [
      { label: 'Give Feedback', desc: 'Share your thoughts about the event', href: `/feedback/${eventId}${qs}`, icon: '⭐', iconBg: '#FFF8E1' },
    ] : []),
  ]

  const NAV_ITEMS = [
    { icon: '←', label: 'All Events', href: `/my-events${qs}` },
    { icon: '🏠', label: 'Event Overview', href: null },
    { icon: '✅', label: 'My RSVP', href: `/rsvp/${eventId}${qs}` },
    ...(isAttending ? [
      { icon: '💬', label: 'Messages', href: `/guest-chat/${eventId}${qs}` },
    ] : []),
    ...(canFeedback ? [
      { icon: '⭐', label: 'Feedback', href: `/feedback/${eventId}${qs}` },
    ] : []),
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
        <p style={{ color: C.textMuted }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: 12, gap: 12, boxSizing: 'border-box' }}>

      {sidebarOpen && (
        <div style={{ width: 220, height: 'calc(100vh - 24px)', background: C.sidebar, color: C.white, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, borderRadius: 20, position: 'sticky', top: 0, alignSelf: 'flex-start', overflowY: 'auto', boxSizing: 'border-box', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 20, borderBottom: '1px solid rgba(255,90,44,0.25)', marginBottom: 16, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: C.accent, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: C.sidebar, flexShrink: 0, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>G</div>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 17, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>GuestHub</span>
          </div>
          <div style={{ color: '#6b574a', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, flexShrink: 0 }}>Menu</div>
          {NAV_ITEMS.map((item, i) => (
            item.href
              ? <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textDecoration: 'none', color: '#c9b9a8', fontSize: 14, background: 'transparent', fontWeight: 400, borderRadius: 11 }}>
                  <span>{item.icon}</span> {item.label}
                </a>
              : <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: C.white, fontWeight: 600, fontSize: 14, background: C.accent, borderRadius: 11 }}>
                  <span>{item.icon}</span> {item.label}
                </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>

        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.text, lineHeight: 1 }}
          >☰</button>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 16 }}>{eventName || 'Event Dashboard'}</span>
        </div>

        <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>

          <div style={{
            background: `linear-gradient(135deg, ${C.sidebar} 0%, ${C.accent} 100%)`,
            borderRadius: 16, padding: '24px 28px', marginBottom: 28, color: C.white,
            boxShadow: '0 4px 20px rgba(107,45,14,0.25)',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 14, opacity: 0.8 }}>Welcome back,</p>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{guestName || 'Guest'} 👋</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>{eventName}</div>
            {eventDate && <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>📆 {fmt(eventDate)}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
            <StatCard icon="🎫" label="Your RSVP Status" value={rsvpLabel} accentBg={rsvpBg} valueColor={rsvpColor} />
            {isAttending && (
              <StatCard
                icon="🚪" label="Check-In Status"
                value={checkedIn ? 'Checked In ✓' : 'Not yet'}
                accentBg={checkedIn ? C.greenBg : '#F3F4F6'}
                valueColor={checkedIn ? C.green : C.textMuted}
              />
            )}
          </div>

          <SectionHeader title="Quick Actions" icon="⚡" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {actions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px',
                  boxShadow: '0 2px 8px rgba(107,45,14,0.06)', transition: 'transform .15s, box-shadow .15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(107,45,14,0.14)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,45,14,0.06)' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: action.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>
                    {action.icon}
                  </div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 4 }}>{action.label}</div>
                  <div style={{ color: C.textMuted, fontSize: 13 }}>{action.desc}</div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default GuestDashboardPage