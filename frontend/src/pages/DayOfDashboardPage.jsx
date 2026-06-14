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

function DayOfDashboardPage() {
  const [dashboard, setDashboard] = useState({ totalGuests: 0, arrivedGuests: 0 })
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    fetchMessages()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/guests/dashboard/1')
      const data = await res.json()
      setDashboard(data)
    } catch (err) {
      console.error('Failed to fetch dashboard')
    }
    setLoading(false)
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/guests/messages/1')
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return alert('Please type a message!')
    try {
      await fetch('/api/guests/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 1, senderId: 1, content: newMessage }),
      })
      setNewMessage('')
      setMessageSent(true)
      fetchMessages()
      setTimeout(() => setMessageSent(false), 3000)
    } catch (err) {
      alert('Failed to send message!')
    }
  }

  const arrivedPercentage = dashboard.totalGuests > 0
    ? Math.round((dashboard.arrivedGuests / dashboard.totalGuests) * 100)
    : 0

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>Day-Of Operations Dashboard</h1>
        <span style={{ color: colors.accentLight, fontSize: '14px' }}>Annual Gala Night — June 20, 2026</span>
      </div>

      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>

          {/* Total Guests */}
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase' }}>Total Guests</p>
            <p style={{ color: colors.text, fontSize: '40px', fontWeight: 'bold', margin: 0 }}>
              {loading ? '...' : dashboard.totalGuests}
            </p>
          </div>

          {/* Arrived Guests */}
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase' }}>Arrived</p>
            <p style={{ color: colors.green, fontSize: '40px', fontWeight: 'bold', margin: 0 }}>
              {loading ? '...' : dashboard.arrivedGuests}
            </p>
          </div>

          {/* Arrival Rate */}
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase' }}>Arrival Rate</p>
            <p style={{ color: colors.accent, fontSize: '40px', fontWeight: 'bold', margin: 0 }}>
              {loading ? '...' : `${arrivedPercentage}%`}
            </p>
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

        {/* Messages Section */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', marginBottom: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>Messages Sent to Guests</p>

          {messages.length === 0 ? (
            <p style={{ color: colors.textMuted, textAlign: 'center' }}>No messages sent yet.</p>
          ) : (
            messages.map((msg) => {
              const seenCount = msg.seenByIds?.length || 0
              return (
                <div key={msg.id} style={{ backgroundColor: colors.accentLight, borderRadius: '8px', padding: '16px', marginBottom: '12px', border: `1px solid ${colors.border}` }}>
                  <p style={{ color: colors.text, margin: '0 0 8px' }}>{msg.content}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted, fontSize: '12px' }}>
                      {new Date(msg.sentAt).toLocaleTimeString()}
                    </span>
                    <span style={{ color: seenCount > 0 ? colors.green : colors.red, fontSize: '12px', fontWeight: 'bold' }}>
                      {seenCount > 0 ? `Seen by ${seenCount}` : 'Not seen yet'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Send Message */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>Send Live Message to All Guests</p>

          {messageSent && (
            <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: colors.green, margin: 0, fontSize: '14px' }}>Message sent to all guests!</p>
            </div>
          )}

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a live update for your guests (e.g. directions, schedule changes...)"
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleSendMessage}
            style={{ marginTop: '12px', width: '100%', padding: '14px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Send to All Guests
          </button>
        </div>

      </div>
    </div>
  )
}

export default DayOfDashboardPage