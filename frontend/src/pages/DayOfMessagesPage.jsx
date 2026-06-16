import React, { useState, useEffect } from 'react'

const colors = {
  accent: '#C4622D', accentLight: '#F5EDE8', cream: '#FBF7F4', border: '#EDE0D9',
  text: '#2C1810', textMuted: '#8B6555', white: '#FFFFFF', red: '#C0392B', redBg: '#FDECEA',
  green: '#2D7A4F', greenBg: '#E8F5EE', sidebar: '#6B2D0E',
}

const API = 'http://localhost:3001'

function DayOfMessagesPage() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [threads, setThreads] = useState([])
  const [activeGuest, setActiveGuest] = useState(null)
  const [thread, setThread] = useState([])
  const [broadcast, setBroadcast] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [reply, setReply] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => { fetchEvents() }, [])
  useEffect(() => { if (eventId) fetchThreads() }, [eventId])

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API}/api/events`)
      const data = await res.json()
      setEvents(data)
      if (data.length) setEventId(String(data[0].id))
    } catch { setInfo('Failed to load events') }
  }

  const fetchThreads = async () => {
    try {
      const res = await fetch(`${API}/api/guests/messages/event/${eventId}/threads`)
      setThreads(await res.json())
    } catch { setInfo('Failed to load guests') }
  }

  const openThread = async (guestId) => {
    setActiveGuest(guestId)
    try {
      const res = await fetch(`${API}/api/guests/messages/thread/${eventId}/${guestId}`)
      setThread(await res.json())
      await fetch(`${API}/api/guests/messages/seen`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId), guestId, reader: 'ORGANIZER' }),
      })
      fetchThreads()
    } catch { setInfo('Failed to open thread') }
  }

  const sendBroadcast = async () => {
    if (!broadcast.trim()) return
    try {
      await fetch(`${API}/api/guests/messages/organizer-broadcast`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId), content: broadcast }),
      })
      setBroadcast('')
      setInfo('Broadcast sent to all guests!')
      fetchThreads()
      if (activeGuest) openThread(activeGuest)
      setTimeout(() => setInfo(''), 3000)
    } catch { setInfo('Failed to broadcast') }
  }

  const sendFollowUp = async () => {
    if (!followUp.trim()) return
    try {
      const res = await fetch(`${API}/api/guests/messages/follow-up`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId), content: followUp }),
      })
      const data = await res.json()
      setFollowUp('')
      setInfo(data.message || 'Follow-up processed')
      fetchThreads()
      if (activeGuest) openThread(activeGuest)
      setTimeout(() => setInfo(''), 4000)
    } catch { setInfo('Failed to send follow-up') }
  }

  const sendReply = async () => {
    if (!reply.trim() || !activeGuest) return
    try {
      await fetch(`${API}/api/guests/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: Number(eventId), guestId: activeGuest, senderRole: 'ORGANIZER', content: reply }),
      })
      setReply('')
      openThread(activeGuest)
      fetchThreads()
    } catch { setInfo('Failed to send') }
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>Day-Of Messages</h1>
        <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Chat with your guests</p>
      </div>

      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Event selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: colors.text, fontWeight: 'bold', marginRight: '8px' }}>Event:</label>
          <select value={eventId} onChange={(e) => { setEventId(e.target.value); setActiveGuest(null); setThread([]) }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px' }}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>

        {info && <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '10px', marginBottom: '16px', color: colors.green, fontSize: '14px' }}>{info}</div>}

        {/* Broadcast box */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', margin: '0 0 12px' }}>Broadcast to All Guests</p>
          <textarea value={broadcast} onChange={(e) => setBroadcast(e.target.value)} rows={2}
            placeholder="Message every guest (directions, schedule changes, welcome)..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }} />
          <button onClick={sendBroadcast}
            style={{ marginTop: '10px', padding: '12px 20px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Send to All Guests
          </button>
        </div>

        {/* Follow-up box */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `2px solid ${colors.red}`, padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: colors.red, fontWeight: 'bold', margin: '0 0 4px' }}>Send Follow-Up to Unseen Guests</p>
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: '0 0 12px' }}>Only guests who haven't seen your previous message will receive this reminder.</p>
          <textarea value={followUp} onChange={(e) => setFollowUp(e.target.value)} rows={2}
            placeholder="Reminder for guests who missed your message..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', backgroundColor: colors.cream, resize: 'none', boxSizing: 'border-box' }} />
          <button onClick={sendFollowUp}
            style={{ marginTop: '10px', padding: '12px 20px', backgroundColor: colors.red, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Send Follow-Up
          </button>
        </div>

        {/* Two columns: guest list + thread */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* Guest list */}
          <div style={{ flex: '0 0 280px', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', margin: 0, padding: '16px', borderBottom: `1px solid ${colors.border}` }}>Guests ({threads.length})</p>
            {threads.length === 0 ? (
              <p style={{ color: colors.textMuted, padding: '16px', fontSize: '14px' }}>No guests for this event.</p>
            ) : threads.map(t => (
              <div key={t.guestId} onClick={() => openThread(t.guestId)}
                style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', backgroundColor: activeGuest === t.guestId ? colors.accentLight : colors.white }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.text, fontWeight: 'bold', fontSize: '14px' }}>{t.name}</span>
                  {t.unreadFromGuest > 0 && <span style={{ backgroundColor: colors.red, color: colors.white, borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{t.unreadFromGuest}</span>}
                </div>
                <p style={{ color: colors.textMuted, margin: '4px 0 0', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.lastMessage || 'No messages yet'}
                </p>
              </div>
            ))}
          </div>

          {/* Thread */}
          <div style={{ flex: 1, backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {!activeGuest ? (
              <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: '180px' }}>Select a guest to view the conversation</p>
            ) : (
              <>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', maxHeight: '420px' }}>
                  {thread.length === 0 ? <p style={{ color: colors.textMuted, textAlign: 'center' }}>No messages yet.</p> :
                    thread.map(m => {
                      const mine = m.senderRole === 'ORGANIZER'
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                          <div style={{ maxWidth: '70%', backgroundColor: mine ? colors.accent : colors.accentLight, color: mine ? colors.white : colors.text, padding: '10px 14px', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '14px' }}>{m.content}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.8, textAlign: 'right' }}>
                              {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {mine && (m.seenByGuest ? ' · Seen' : ' · Sent')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
                <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: `1px solid ${colors.border}` }}>
                  <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    placeholder="Type a reply..."
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px' }} />
                  <button onClick={sendReply} style={{ padding: '10px 18px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayOfMessagesPage