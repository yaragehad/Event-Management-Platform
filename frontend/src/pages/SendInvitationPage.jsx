import React, { useState } from 'react'

const colors = {
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
  sidebar: '#1b0f06',
}

function SendInvitationPage() {
  const [guestEmail, setGuestEmail] = useState('')
  const [guestName, setGuestName] = useState('')
  const [eventId, setEventId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!guestEmail.trim()) return alert('Please enter guest email!')
    if (!guestName.trim()) return alert('Please enter guest name!')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestEmail, guestName, eventId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send invitation')
        setLoading(false)
        return
      }
      setSuccess(true)
      setGuestEmail('')
      setGuestName('')
    } catch (err) {
      setError('Something went wrong. Please try again!')
    }
    setLoading(false)
  }

  const handleSendAll = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/email/send-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send invitations')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again!')
    }
    setLoading(false)
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>Send Invitations</h1>
        <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Send digital invitations to your guests via email</p>
      </div>

      <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Success Message */}
        {success && (
          <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ color: colors.green, margin: 0, fontWeight: 'bold' }}>Invitation sent successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ color: colors.red, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Send to Single Guest */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', marginBottom: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>Send to a Single Guest</p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Guest Name</p>
            <input
              type="text"
              placeholder="Enter guest name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Guest Email</p>
            <input
              type="email"
              placeholder="Enter guest email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Event ID</p>
            <input
              type="text"
              placeholder="Enter event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? colors.textMuted : colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>

        {/* Send to All Guests */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Send to All Guests</p>
          <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '16px' }}>This will send personalized invitation emails to all guests of the event automatically.</p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '8px' }}>Event ID</p>
            <input
              type="text"
              placeholder="Enter event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleSendAll}
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? colors.textMuted : colors.sidebar, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Sending...' : 'Send to All Guests'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default SendInvitationPage