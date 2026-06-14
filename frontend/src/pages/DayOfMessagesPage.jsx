import React, { useState, useEffect } from 'react'

const colors = {
  accent: '#C4622D',
  accentLight: '#F5EDE8',
  cream: '#FBF7F4',
  border: '#EDE0D9',
  text: '#2C1810',
  textMuted: '#8B6555',
  white: '#FFFFFF',
  red: '#C0392B',
  redBg: '#FDECEA',
  green: '#2D7A4F',
  greenBg: '#E8F5EE',
  sidebar: '#6B2D0E',
}

function DayOfMessagesPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [followUpSent, setFollowUpSent] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/guests/messages/1')
      const data = await res.json()
      setMessages(data)
      const hasUnseen = data.some(msg => !msg.seenByIds?.includes(1))
      setShowFollowUp(hasUnseen)
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return alert('Please type a message!')
    try {
      await fetch('/api/guests/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 1, senderId: 1, content: newMessage }),
      })
      setNewMessage('')
      setSent(true)
      fetchMessages()
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      alert('Failed to send message!')
    }
  }

  const handleSendFollowUp = async () => {
    if (!followUpMessage.trim()) return alert('Please type a follow-up message!')
    try {
      await fetch('/api/guests/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 1, senderId: 1, content: followUpMessage }),
      })
      setFollowUpMessage('')
      setFollowUpSent(true)
      fetchMessages()
      setTimeout(() => setFollowUpSent(false), 3000)
    } catch (err) {
      alert('Failed to send follow-up message!')
    }
  }

  const handleMarkSeen = async (messageId) => {
    try {
      await fetch(`/api/guests/messages/${messageId}/seen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 }),
      })
      fetchMessages()
    } catch (err) {
      console.error('Failed to mark message as seen')
    }
  }

  const unseenMessages = messages.filter(msg => !msg.seenByIds?.includes(1))
  const seenMessages = messages.filter(msg => msg.seenByIds?.includes(1))

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>Day-Of Messages</h1>
        <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Live updates from the organizer</p>
      </div>

      <div style={{ padding: '32px', maxWidth: '680px', margin: '0 auto' }}>

        {/* Send Message Section */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px', marginBottom: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>Send Message to All Guests</p>

          {sent && (
            <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
              <p style={{ color: colors.green, margin: 0, fontSize: '14px' }}>Message sent successfully!</p>
            </div>
          )}

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to all guests (e.g. directions, schedule changes, welcome message)..."
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleSend}
            style={{ marginTop: '12px', width: '100%', padding: '14px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            Send to All Guests
          </button>
        </div>

        {/* Follow-up Section — only shows if there are unseen messages */}
        {showFollowUp && (
          <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `2px solid ${colors.red}`, padding: '24px', marginBottom: '24px' }}>
            <p style={{ color: colors.red, fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Follow-Up Required</p>
            <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '16px' }}>
              {unseenMessages.length} guest(s) have not seen your previous message. Send them a follow-up!
            </p>

            {followUpSent && (
              <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                <p style={{ color: colors.green, margin: 0, fontSize: '14px' }}>Follow-up sent successfully!</p>
              </div>
            )}

            <textarea
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              placeholder="Type your follow-up message for guests who haven't seen the initial message..."
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.text, backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSendFollowUp}
              style={{ marginTop: '12px', width: '100%', padding: '14px', backgroundColor: colors.red, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              Send Follow-Up to Unseen Guests
            </button>
          </div>
        )}

        {/* Messages List */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '24px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>
            All Messages
            <span style={{ color: colors.textMuted, fontWeight: 'normal', fontSize: '13px', marginLeft: '8px' }}>
              ({messages.length} total — {unseenMessages.length} unseen, {seenMessages.length} seen)
            </span>
          </p>

          {messages.length === 0 ? (
            <p style={{ color: colors.textMuted, textAlign: 'center' }}>No messages sent yet.</p>
          ) : (
            messages.map((msg) => {
              const isSeen = msg.seenByIds?.includes(1)
              return (
                <div
                  key={msg.id}
                  style={{
                    backgroundColor: isSeen ? colors.greenBg : colors.redBg,
                    border: `1px solid ${isSeen ? colors.green : colors.red}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                  }}
                >
                  <p style={{ margin: '0 0 8px', color: colors.text }}>{msg.content}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: colors.textMuted }}>
                      {new Date(msg.sentAt).toLocaleTimeString()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: isSeen ? colors.green : colors.red, fontWeight: 'bold' }}>
                        {isSeen ? 'Seen' : 'Not Seen'}
                      </span>
                      {!isSeen && (
                        <button
                          onClick={() => handleMarkSeen(msg.id)}
                          style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Mark as Seen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

export default DayOfMessagesPage