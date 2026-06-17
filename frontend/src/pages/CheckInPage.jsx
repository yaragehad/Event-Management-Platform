import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

const colors = {
  accent: '#C4622D', accentLight: '#F5EDE8', cream: '#FBF7F4', border: '#EDE0D9',
  text: '#2C1810', textMuted: '#8B6555', white: '#FFFFFF', green: '#2D7A4F', greenBg: '#E8F5EE',
  red: '#C0392B', redBg: '#FDECEA', sidebar: '#6B2D0E',
}

const API = 'http://localhost:3001'

function CheckInPage() {
  const { eventId } = useParams()
  const [guests, setGuests] = useState([])
  const [email, setEmail] = useState('')
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => { fetchList() }, [eventId])

  // stop camera if you leave the page
  useEffect(() => {
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}) }
  }, [])

  const fetchList = async () => {
    try {
      const res = await fetch(`${API}/api/guests/checkin-list/${eventId}`)
      setGuests(await res.json())
    } catch { setError('Failed to load guest list') }
  }

  const doCheckIn = async (guestId) => {
    setError(''); setInfo('')
    try {
      const res = await fetch(`${API}/api/guests/${guestId}/checkin`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Check-in failed'); return }
      // send confirmation email
      if (data.email) {
        await fetch(`${API}/api/email/checkin-confirmation`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestEmail: data.email, guestName: data.name, eventId }),
        })
      }
      setInfo(`${data.name} checked in! Confirmation email sent.`)
      fetchList()
      setTimeout(() => setInfo(''), 5000)
    } catch { setError('Check-in failed') }
  }

  // ── Email confirmation ──
  const checkInByEmail = () => {
    if (!email.trim()) return
    const match = guests.find(g => g.email.toLowerCase() === email.toLowerCase().trim())
    if (!match) { setError('No guest with that email is registered for this event.'); return }
    if (match.checkInStatus) { setError(`${match.name} is already checked in.`); return }
    doCheckIn(match.guestId)
    setEmail('')
  }

  // ── QR camera scan ──
  const startScan = async () => {
    setError(''); setInfo(''); setScanning(true)
    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // expect JSON {guestId, eventId}
          let payload
          try { payload = JSON.parse(decodedText) } catch { setError('Unrecognized QR code'); return }
          await scanner.stop().catch(() => {})
          setScanning(false)
          if (payload.guestId) doCheckIn(payload.guestId)
          else setError('QR code missing guest info')
        },
        () => {} // ignore per-frame scan errors
      )
    } catch {
      setError('Could not start camera. Use email check-in below.')
      setScanning(false)
    }
  }

  const stopScan = async () => {
    if (scannerRef.current) await scannerRef.current.stop().catch(() => {})
    setScanning(false)
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: colors.sidebar, padding: '16px 32px' }}>
        <h1 style={{ color: colors.white, margin: 0, fontSize: '20px' }}>🎟️ Staff Check-In</h1>
        <p style={{ color: colors.accentLight, margin: '4px 0 0', fontSize: '14px' }}>Scan a guest's QR or confirm by email</p>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        {info && <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '12px', marginBottom: '16px', color: colors.green, fontWeight: 'bold' }}>{info}</div>}
        {error && <div style={{ backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '12px', marginBottom: '16px', color: colors.red }}>{error}</div>}

        {/* QR scanner */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', margin: '0 0 12px' }}>Scan Guest QR Code</p>
          <div id="reader" style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }} />
          {!scanning ? (
            <button onClick={startScan} style={{ marginTop: '12px', padding: '12px 24px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Start Camera</button>
          ) : (
            <button onClick={stopScan} style={{ marginTop: '12px', padding: '12px 24px', backgroundColor: colors.red, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Stop Camera</button>
          )}
        </div>

        {/* Email fallback */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', margin: '0 0 12px' }}>Or Confirm by Email</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkInByEmail()}
              placeholder="guest@email.com"
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px', boxSizing: 'border-box' }} />
            <button onClick={checkInByEmail} style={{ padding: '12px 20px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Check In</button>
          </div>
        </div>

        {/* Guest list */}
        <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          <p style={{ color: colors.text, fontWeight: 'bold', margin: 0, padding: '16px', borderBottom: `1px solid ${colors.border}` }}>Guest List ({guests.length})</p>
          {guests.length === 0 ? (
            <p style={{ color: colors.textMuted, padding: '16px' }}>No guests for this event.</p>
          ) : guests.map(g => (
            <div key={g.guestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <p style={{ color: colors.text, fontWeight: 'bold', margin: 0, fontSize: '14px' }}>{g.name}</p>
                <p style={{ color: colors.textMuted, margin: '2px 0 0', fontSize: '12px' }}>{g.email}</p>
              </div>
              {g.checkInStatus ? (
                <span style={{ color: colors.green, fontWeight: 'bold', fontSize: '13px' }}>✓ Checked In</span>
              ) : (
                <button onClick={() => doCheckIn(g.guestId)} style={{ padding: '8px 14px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Check In</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CheckInPage