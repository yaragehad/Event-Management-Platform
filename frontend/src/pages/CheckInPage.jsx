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

function CheckInPage() {
  const [guestId, setGuestId] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckIn = async () => {
    if (!guestId.trim()) return alert('Please enter your Guest ID!')
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/guests/${guestId}/checkin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        setError('Guest not found. Please check your ID and try again.')
        setLoading(false)
        return
      }
      setCheckedIn(true)
    } catch (err) {
      setError('Something went wrong. Please try again!')
    }
    setLoading(false)
  }

  if (checkedIn) {
    return (
      <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ color: colors.green, margin: '0 0 12px' }}>You're Checked In!</h2>
          <p style={{ color: colors.textMuted, margin: '0 0 24px' }}>Welcome! Enjoy the event.</p>
          <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '16px' }}>
            <p style={{ color: colors.green, margin: 0, fontWeight: 'bold' }}>✅ Check-in confirmed</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ backgroundColor: colors.accent, padding: '24px 32px' }}>
          <h1 style={{ color: colors.white, margin: 0, fontSize: '22px' }}>🎟️ Event Check-In</h1>
          <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Annual Gala Night — June 20, 2026</p>
        </div>

        {/* Check-in Form */}
        <div style={{ padding: '32px' }}>

          {/* QR Code Display */}
          <div style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '80px', marginBottom: '8px' }}>📱</div>
            <p style={{ color: colors.text, fontWeight: 'bold', margin: '0 0 4px' }}>Your QR Code</p>
            <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0 }}>Show this to staff at the entrance</p>
            <div style={{ marginTop: '16px', backgroundColor: colors.white, borderRadius: '8px', padding: '16px', border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.accent, fontWeight: 'bold', fontSize: '24px', margin: 0, letterSpacing: '4px' }}>GUEST-001</p>
            </div>
          </div>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
            <span style={{ color: colors.textMuted, fontSize: '14px' }}>OR enter your Guest ID</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
          </div>

          {/* Guest ID Input */}
          <input
            type="text"
            placeholder="Enter your Guest ID (e.g. 1)"
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, boxSizing: 'border-box' }}
          />

          {/* Error Message */}
          {error && (
            <div style={{ marginTop: '12px', backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: colors.red, margin: 0, fontSize: '14px' }}>❌ {error}</p>
            </div>
          )}

          {/* Check-in Button */}
          <button
            onClick={handleCheckIn}
            disabled={loading}
            style={{ marginTop: '20px', width: '100%', padding: '14px', backgroundColor: loading ? colors.textMuted : colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Checking in...' : 'Check In Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckInPage