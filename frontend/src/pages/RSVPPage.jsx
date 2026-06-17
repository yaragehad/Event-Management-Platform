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

function RSVPPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const guestId = parseInt(searchParams.get('guestId')) || 1
  const [status, setStatus] = useState('')
  const [dietary, setDietary] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [existingRSVP, setExistingRSVP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guestEmail, setGuestEmail] = useState('')
  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    checkExistingRSVP()
  }, [])

  const checkExistingRSVP = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/guests/${guestId}`)
      const data = await res.json()
      setGuestEmail(data.user?.email || '')
      setGuestName(data.user?.name || '')
      const rsvp = data.rsvps?.find(r => r.eventId === parseInt(eventId))
      if (rsvp) {
        setExistingRSVP(rsvp)
        setStatus(rsvp.status)
        setNotes(rsvp.notes || '')
        setDietary(data.dietaryPreference || '')
      }
    } catch (err) {
      console.error('Failed to check RSVP')
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!status) return alert('Please select your attendance status!')
    try {
      if (existingRSVP) {
        await fetch(`http://localhost:3001/api/guests/rsvp/${existingRSVP.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, dietaryPreference: dietary, notes }),
        })
      } else {
        await fetch('http://localhost:3001/api/guests/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId,
            eventId: parseInt(eventId),
            status,
            dietaryPreference: dietary,
            notes,
          }),
        })
      }

      if (guestEmail) {
        await fetch('http://localhost:3001/api/email/rsvp-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestEmail,
            guestName,
            status,
            eventId,
            guestId,
          }),
        })
      }

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong, please try again!')
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: colors.textMuted }}>Loading...</p>
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
          <h2 style={{ color: colors.green, margin: '0 0 12px' }}>
            {existingRSVP ? 'RSVP Updated!' : 'RSVP Confirmed!'}
          </h2>
          <p style={{ color: colors.textMuted, margin: '0 0 12px' }}>
            {existingRSVP ? 'Your RSVP has been updated successfully.' : 'Thank you! Your response has been recorded successfully.'}
          </p>
          {guestEmail && (
            <p style={{ color: colors.textMuted, fontSize: '13px', margin: '0 0 20px' }}>
              A confirmation email has been sent to {guestEmail}
            </p>
          )}

          {status === 'ATTENDING' && (
            <>
              <a href={`/guest-chat/${eventId}?guestId=${guestId}`} style={{ display: 'block', backgroundColor: colors.accent, color: colors.white, textAlign: 'center', padding: '14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', marginBottom: '12px' }}>
                Message the Organizer
              </a>
              <a href={`/my-qr/${eventId}?guestId=${guestId}`} style={{ display: 'block', backgroundColor: colors.green, color: colors.white, textAlign: 'center', padding: '14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                Show My Check-In QR
              </a>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>

        <div style={{ backgroundColor: colors.accent, padding: '24px 32px' }}>
          <h1 style={{ color: colors.white, margin: 0, fontSize: '22px' }}>
            {existingRSVP ? 'Update Your RSVP' : 'RSVP Form'}
          </h1>
          {guestName && <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Welcome, {guestName}!</p>}
        </div>

        <div style={{ padding: '32px' }}>

          {existingRSVP && (
            <div style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
              <p style={{ color: colors.textMuted, margin: 0, fontSize: '13px' }}>Current status: <strong style={{ color: colors.accent }}>{existingRSVP.status}</strong> — you can update it below</p>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '12px' }}>Will you be attending?</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['ATTENDING', 'NOT_ATTENDING', 'MAYBE'].map((option) => (
                <button
                  key={option}
                  onClick={() => setStatus(option)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: `2px solid ${status === option ? colors.accent : colors.border}`,
                    backgroundColor: status === option ? colors.accentLight : colors.white,
                    color: status === option ? colors.accent : colors.textMuted,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {option === 'ATTENDING' ? 'Attending' : option === 'NOT_ATTENDING' ? 'Not Attending' : 'Maybe'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Dietary Preferences</p>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, color: colors.text, fontSize: '14px' }}
            >
              <option value="">No preference</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-free">Gluten-free</option>
              <option value="Halal">Halal</option>
              <option value="Kosher">Kosher</option>
              <option value="Nut allergy">Nut allergy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Special Requirements / Additional Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write any additional dietary requirements or special needs here..."
              rows={3}
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
            {existingRSVP ? 'Update RSVP' : 'Submit RSVP'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RSVPPage