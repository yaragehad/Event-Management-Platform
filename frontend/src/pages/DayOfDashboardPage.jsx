import React, { useState, useEffect } from 'react'

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
  sidebar: '#6B2D0E',
}

const API = 'http://localhost:3001'

function DayOfDashboardPage() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [dashboard, setDashboard] = useState({ totalGuests: 0, arrivedGuests: 0 })
  const [loading, setLoading] = useState(true)
  const [feedbackInfo, setFeedbackInfo] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { fetchEvents() }, [])
  useEffect(() => { if (eventId) fetchDashboard() }, [eventId])

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API}/api/events`)
      const data = await res.json()
      setEvents(data)
      if (data.length) setEventId(String(data[0].id))
    } catch (err) {
      console.error('Failed to fetch events')
    }
  }

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/guests/dashboard/${eventId}`)
      const data = await res.json()
      setDashboard(data)
    } catch (err) {
      console.error('Failed to fetch dashboard')
    }
    setLoading(false)
  }

  const sendFeedbackLinks = async () => {
    setSending(true)
    setFeedbackInfo('')
    try {
      const res = await fetch(`${API}/api/email/feedback-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId) }),
      })
      const data = await res.json()
      setFeedbackInfo(data.message || 'Done')
    } catch (err) {
      setFeedbackInfo('Failed to send feedback links')
    }
    setSending(false)
  }

  const arrivedPercentage = dashboard.totalGuests > 0
    ? Math.round((dashboard.arrivedGuests / dashboard.totalGuests) * 100)
    : 0

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>Day-Of Operations Dashboard</h1>
        <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Live attendance tracking</p>
      </div>

      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Event selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: colors.text, fontWeight: 'bold', marginRight: '8px' }}>Event:</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px' }}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase' }}>Total Guests</p>
            <p style={{ color: colors.text, fontSize: '40px', fontWeight: 'bold', margin: 0 }}>{loading ? '...' : dashboard.totalGuests}</p>
          </div>
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase' }}>Arrived</p>
            <p style={{ color: colors.green, fontSize: '40px', fontWeight: 'bold', margin: 0 }}>{loading ? '...' : dashboard.arrivedGuests}</p>
          </div>
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase' }}>Arrival Rate</p>
            <p style={{ color: colors.accent, fontSize: '40px', fontWeight: 'bold', margin: 0 }}>{loading ? '...' : `${arrivedPercentage}%`}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', marginBottom: '32px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', marginBottom: '12px' }}>Guest Arrival Progress</p>
          <div style={{ backgroundColor: colors.accentLight, borderRadius: '999px', height: '16px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: colors.green, height: '100%', width: `${arrivedPercentage}%`, borderRadius: '999px', transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '8px' }}>
            {dashboard.arrivedGuests} out of {dashboard.totalGuests} guests have arrived
          </p>
        </div>

        {/* Post-Event Feedback */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px' }}>Post-Event Feedback</p>
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: '0 0 16px' }}>
            Send a feedback request to all guests who checked in to this event. Use this after the event ends.
          </p>

          {feedbackInfo && (
            <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: colors.green, margin: 0, fontSize: '14px' }}>{feedbackInfo}</p>
            </div>
          )}

          <button
            onClick={sendFeedbackLinks}
            disabled={sending}
            style={{ width: '100%', padding: '14px', backgroundColor: sending ? colors.textMuted : colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: sending ? 'not-allowed' : 'pointer' }}
          >
            {sending ? 'Sending...' : 'Send Feedback Links to Checked-In Guests'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default DayOfDashboardPage