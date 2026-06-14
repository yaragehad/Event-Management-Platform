import React, { useState } from 'react'

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
  const [status, setStatus] = useState('')
  const [dietary, setDietary] = useState('')
  const [dietaryNote, setDietaryNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!status) return alert('Please select your attendance status!')
    try {
      await fetch('/api/guests/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: 1,
          eventId: 1,
          status,
          dietaryPreference: dietary ? `${dietary}${dietaryNote ? ' - ' + dietaryNote : ''}` : dietaryNote,
        }),
      })
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong, please try again!')
    }
  }

  if (submitted) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: colors.greenBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: colors.green, fontSize: '32px' }}>✓</span>
          </div>
          <h2 style={{ color: colors.green, margin: '0 0 12px' }}>RSVP Confirmed!</h2>
          <p style={{ color: colors.textMuted, margin: 0 }}>Thank you! Your response has been recorded successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ backgroundColor: colors.accent, padding: '24px 32px' }}>
          <h1 style={{ color: colors.white, margin: 0, fontSize: '22px' }}>RSVP Form</h1>
          <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Annual Gala Night — June 20, 2026</p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px' }}>

          {/* Attendance Status */}
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

          {/* Dietary Preferences Dropdown */}
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

          {/* Dietary Free Text */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Special Requirements / Additional Notes</p>
            <textarea
              value={dietaryNote}
              onChange={(e) => setDietaryNote(e.target.value)}
              placeholder="Write any additional dietary requirements or special needs here..."
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: '16px', backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: colors.red, margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            style={{ width: '100%', padding: '14px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Submit RSVP
          </button>
        </div>
      </div>
    </div>
  )
}

export default RSVPPage