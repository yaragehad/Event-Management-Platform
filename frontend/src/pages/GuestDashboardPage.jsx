import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const colors = {
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
  sidebar: '#6B2D0E',
}

const API = 'http://localhost:3001'

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const guestRes = await fetch(`${API}/api/guests/${guestId}`)
      const guest = await guestRes.json()
      if (guest.user?.name) setGuestName(guest.user.name)
      setCheckedIn(!!guest.checkInStatus)
      const rsvp = guest.rsvps?.find(r => r.eventId === parseInt(eventId))
      if (rsvp) setRsvpStatus(rsvp.status)

      const eventRes = await fetch(`${API}/api/events/${eventId}`)
      const event = await eventRes.json()
      if (event.name) setEventName(event.name)
      if (event.date) setEventDate(new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    } catch (err) {
      console.error('Failed to load dashboard')
    }
    setLoading(false)
  }

  const statusLabel = rsvpStatus === 'ATTENDING' ? 'Attending'
    : rsvpStatus === 'NOT_ATTENDING' ? 'Not Attending'
    : rsvpStatus === 'MAYBE' ? 'Maybe' : 'Not responded yet'
  const statusColor = rsvpStatus === 'ATTENDING' ? colors.green
    : rsvpStatus === 'NOT_ATTENDING' ? colors.red : colors.accent

  const qs = `?guestId=${guestId}`

  const cards = [
    { label: 'View Invitation', desc: 'See event details', href: `/invitation/${eventId}${qs}`, color: colors.accent },
    { label: rsvpStatus === 'PENDING' ? 'RSVP Now' : 'Update RSVP', desc: 'Confirm your attendance', href: `/rsvp/${eventId}${qs}`, color: colors.accent },
    { label: 'My Check-In QR', desc: 'Show this at the entrance', href: `/my-qr/${eventId}${qs}`, color: colors.green },
    { label: 'Message the Organizer', desc: 'Ask a question or get updates', href: `/guest-chat/${eventId}${qs}`, color: colors.sidebar },
    { label: 'Give Feedback', desc: 'Share your thoughts after the event', href: `/feedback/${eventId}${qs}`, color: colors.accent },
  ]

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: colors.textMuted }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ backgroundColor: colors.accent, borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
          <p style={{ color: colors.accentLight, margin: 0, fontSize: '14px' }}>Welcome back,</p>
          <h1 style={{ color: colors.white, margin: '4px 0 16px', fontSize: '28px' }}>{guestName || 'Guest'}</h1>
          <p style={{ color: colors.white, margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{eventName}</p>
          {eventDate && <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>{eventDate}</p>}
        </div>

        {/* Status row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px' }}>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: '12px', letterSpacing: '1px' }}>YOUR RSVP</p>
            <p style={{ color: statusColor, margin: '6px 0 0', fontSize: '20px', fontWeight: 'bold' }}>{statusLabel}</p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px' }}>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: '12px', letterSpacing: '1px' }}>CHECK-IN</p>
            <p style={{ color: checkedIn ? colors.green : colors.textMuted, margin: '6px 0 0', fontSize: '20px', fontWeight: 'bold' }}>{checkedIn ? 'Checked In ✓' : 'Not checked in yet'}</p>
          </div>
        </div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {cards.map((card) => (
            <a key={card.label} href={card.href} style={{ textDecoration: 'none', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', display: 'block', transition: 'transform 0.1s' }}>
              <div style={{ width: '40px', height: '4px', backgroundColor: card.color, borderRadius: '2px', marginBottom: '16px' }} />
              <p style={{ color: colors.text, margin: 0, fontSize: '17px', fontWeight: 'bold' }}>{card.label}</p>
              <p style={{ color: colors.textMuted, margin: '6px 0 0', fontSize: '14px' }}>{card.desc}</p>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}

export default GuestDashboardPage