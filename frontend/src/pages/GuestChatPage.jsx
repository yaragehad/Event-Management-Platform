import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const colors = {
  accent: '#ff5a2c', accentLight: '#ffe7dc', cream: '#fdf4e9', border: '#f0e3d2',
  text: '#241407', textMuted: '#8a7a68', white: '#ffffff', sidebar: '#1b0f06',
}

const API = 'http://localhost:3001'

function GuestChatPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const guestId = parseInt(searchParams.get('guestId'))
  const [thread, setThread] = useState([])
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!guestId) { setError('Missing guest ID — open this from your invitation link.'); return }
    loadThread()
    const timer = setInterval(loadThread, 5000) // refresh every 5s so new organizer messages appear
    return () => clearInterval(timer)
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const loadThread = async () => {
    try {
      const res = await fetch(`${API}/api/guests/messages/thread/${eventId}/${guestId}`)
      const data = await res.json()
      setThread(data)
      // guest is reading → mark organizer messages seen
      await fetch(`${API}/api/guests/messages/seen`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId), guestId, reader: 'GUEST' }),
      })
    } catch {
      setError('Failed to load messages')
    }
  }

  const sendReply = async () => {
    if (!reply.trim()) return
    try {
      await fetch(`${API}/api/guests/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId), guestId, senderRole: 'GUEST', content: reply }),
      })
      setReply('')
      loadThread()
    } catch {
      setError('Failed to send')
    }
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>Event Messages</h1>
        <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Chat with the event organizer</p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
        {error && <p style={{ color: colors.textMuted, textAlign: 'center' }}>{error}</p>}

        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', height: '70vh' }}>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {thread.length === 0 ? (
              <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: '40px' }}>No messages yet. The organizer will message you here.</p>
            ) : thread.map(m => {
              const mine = m.senderRole === 'GUEST'
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                  <div style={{ maxWidth: '70%', backgroundColor: mine ? colors.accent : colors.accentLight, color: mine ? colors.white : colors.text, padding: '10px 14px', borderRadius: '12px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '10px', opacity: 0.7, fontWeight: 'bold' }}>{mine ? 'You' : 'Organizer'}</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>{m.content}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.8, textAlign: 'right' }}>
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {mine && (m.seenByOrganizer ? ' · Seen' : ' · Sent')}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: `1px solid ${colors.border}` }}>
            <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px' }} />
            <button onClick={sendReply} style={{ padding: '12px 20px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuestChatPage