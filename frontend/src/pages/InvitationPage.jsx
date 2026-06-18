import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'

const colors = {
  accent: '#ff5a2c',
  accentLight: '#ffe7dc',
  cream: '#fdf4e9',
  border: '#f0e3d2',
  text: '#241407',
  textMuted: '#8a7a68',
  white: '#ffffff',
}

const API = 'http://localhost:3001'

function InvitationPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email')
  const guestIdParam = searchParams.get('guestId')

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [going, setGoing] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [])

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API}/api/events/${eventId}`)
      const data = await res.json()
      setEvent(data)
    } catch (err) {
      setError('Failed to load invitation')
    }
    setLoading(false)
  }

  // Go to RSVP, carrying guestId forward however we got here
  const handleRSVP = async () => {
    setGoing(true)
    try {
      // Came from dashboard (or any link with guestId) → use it directly
      if (guestIdParam) {
        navigate(`/rsvp/${eventId}?guestId=${guestIdParam}`)
        return
      }
      // Came from an email link (with email) → resolve guestId from email
      if (email) {
        const res = await fetch(`${API}/api/guests/lookup?email=${encodeURIComponent(email)}&eventId=${eventId}`)
        const data = await res.json()
        if (data.registered && data.guestId) {
          navigate(`/rsvp/${eventId}?guestId=${data.guestId}`)
          return
        }
        // not registered yet → register them, then go to RSVP
        const reg = await fetch(`${API}/api/guests/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: parseInt(eventId), name: email.split('@')[0], email }),
        })
        const regData = await reg.json()
        if (regData.guestId) {
          navigate(`/rsvp/${eventId}?guestId=${regData.guestId}`)
          return
        }
      }
      // fallback: no guestId and no email
      navigate(`/rsvp/${eventId}`)
    } catch (err) {
      navigate(`/rsvp/${eventId}`)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: colors.textMuted }}>Loading invitation...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: colors.textMuted }}>Invitation not found.</p>
      </div>
    )
  }

  const Detail = ({ label, value }) => (
    <div>
      <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px', letterSpacing: '1px' }}>{label}</p>
      <p style={{ margin: '2px 0 0', color: colors.text, fontWeight: 'bold' }}>{value}</p>
    </div>
  )

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>

        <div style={{ backgroundColor: colors.accent, padding: '32px', textAlign: 'center' }}>
          <h1 style={{ color: colors.white, margin: 0, fontSize: '28px' }}>You're Invited!</h1>
          <p style={{ color: colors.accentLight, margin: '8px 0 0', fontSize: '16px' }}>Please join us for a special evening</p>
        </div>

        <div style={{ padding: '32px' }}>
          <h2 style={{ color: colors.text, fontSize: '24px', marginBottom: '24px' }}>{event.name}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Detail label="DATE" value={formatDate(event.date)} />
            <Detail label="TIME" value={event.time || '6:00 PM'} />
            {event.booking?.venue && <Detail label="VENUE" value={event.booking.venue.name} />}
            <Detail label="DRESS CODE" value={event.dressCode || 'Formal / Business Attire'} />
            <Detail label="AGENDA" value={event.agenda || 'Welcome reception, main program, networking & dinner'} />
            {event.description && <Detail label="DESCRIPTION" value={event.description} />}
          </div>

          <button onClick={handleRSVP} disabled={going}
            style={{ display: 'block', width: '100%', marginTop: '32px', backgroundColor: colors.accent, color: colors.white, textAlign: 'center', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: going ? 'not-allowed' : 'pointer' }}>
            {going ? 'Loading...' : 'RSVP Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvitationPage