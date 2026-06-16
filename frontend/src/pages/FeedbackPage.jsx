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
  redBg: '#FDECEA',
}

const API = 'http://localhost:3001'

function StarRating({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', color: star <= value ? colors.accent : colors.border }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedbackPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const guestId = parseInt(searchParams.get('guestId')) || 1

  const [allowed, setAllowed] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [eventName, setEventName] = useState('')
  const [overall, setOverall] = useState(0)
  const [food, setFood] = useState(0)
  const [venue, setVenue] = useState(0)
  const [organization, setOrganization] = useState(0)
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAccess()
    fetchEvent()
  }, [])

  const checkAccess = async () => {
    try {
      const res = await fetch(`${API}/api/guests/${guestId}`)
      const data = await res.json()
      if (data.user?.name) setGuestName(data.user.name)
      if (data.user?.email) setGuestEmail(data.user.email)
      const attendingRSVP = data.rsvps?.find(r => r.eventId === parseInt(eventId) && r.status === 'ATTENDING')
      setAllowed(!!attendingRSVP)
    } catch (err) {
      setAllowed(false)
    }
  }

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API}/api/events/${eventId}`)
      const data = await res.json()
      setEventName(data.name || '')
    } catch (err) {
      // event name is optional
    }
  }

  const handleSubmit = async () => {
    if (!guestName.trim()) return alert('Please enter your name!')
    if (overall === 0) return alert('Please rate your overall experience!')
    setError('')
    try {
      const res = await fetch(`${API}/api/guests/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: parseInt(eventId),
          guestName,
          overall,
          food: food || null,
          venue: venue || null,
          organization: organization || null,
          comments,
        }),
      })
      if (!res.ok) {
        setError('Something went wrong. Please try again!')
        return
      }

      // send thank-you email
      if (guestEmail) {
        await fetch(`${API}/api/email/feedback-thankyou`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestEmail, guestName, eventId: parseInt(eventId) }),
        })
      }

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again!')
    }
  }

  if (allowed === null) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: colors.textMuted }}>Loading...</p>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: colors.redBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: colors.red, fontSize: '32px' }}>✕</span>
          </div>
          <h2 style={{ color: colors.red, margin: '0 0 12px' }}>Access Denied</h2>
          <p style={{ color: colors.textMuted, margin: 0 }}>Only guests who attended the event can submit feedback.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: colors.greenBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: colors.green, fontSize: '32px' }}>✓</span>
          </div>
          <h2 style={{ color: colors.green, margin: '0 0 12px' }}>Thank You!</h2>
          <p style={{ color: colors.textMuted, margin: '0 0 24px' }}>Your feedback has been submitted successfully. We really appreciate your time!</p>
          <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '16px' }}>
            <p style={{ color: colors.green, margin: 0, fontWeight: 'bold' }}>Feedback received — a confirmation email is on its way.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>

        <div style={{ backgroundColor: colors.accent, padding: '24px 32px' }}>
          <h1 style={{ color: colors.white, margin: 0, fontSize: '22px' }}>Post-Event Feedback</h1>
          {eventName && <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>{eventName}</p>}
        </div>

        <div style={{ padding: '32px' }}>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Your Name</p>
            <input
              type="text"
              placeholder="Enter your full name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, boxSizing: 'border-box' }}
            />
          </div>

          <StarRating label="Overall Experience" value={overall} onChange={setOverall} />
          <StarRating label="Food and Beverages" value={food} onChange={setFood} />
          <StarRating label="Venue" value={venue} onChange={setVenue} />
          <StarRating label="Organization" value={organization} onChange={setOrganization} />

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Additional Comments</p>
            <textarea
              placeholder="Share any additional thoughts or suggestions..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: '16px', backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: colors.red, margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            style={{ width: '100%', padding: '14px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage