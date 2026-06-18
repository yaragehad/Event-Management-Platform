import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG as QRCode } from 'qrcode.react'

const colors = {
  accent: '#ff5a2c', accentLight: '#ffe7dc', cream: '#fdf4e9', border: '#f0e3d2',
  text: '#241407', textMuted: '#8a7a68', white: '#ffffff', green: '#0f7a44', greenBg: '#e7f7ee',
}

function MyQRPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const guestId = searchParams.get('guestId')
  const [guest, setGuest] = useState(null)

  useEffect(() => {
    if (guestId) {
      fetch(`http://localhost:3001/api/guests/${guestId}`)
        .then(r => r.json())
        .then(d => setGuest(d))
        .catch(() => {})
    }
  }, [guestId])

  // QR encodes the check-in payload staff will scan
  const qrValue = JSON.stringify({ guestId: Number(guestId), eventId: Number(eventId) })

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '20px' }}>
      <div style={{ backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ color: colors.text, margin: '0 0 4px', fontSize: '22px' }}>Your Check-In Pass</h1>
        <p style={{ color: colors.textMuted, fontSize: '14px', margin: '0 0 24px' }}>Show this QR code to staff at the entrance</p>

        <div style={{ display: 'inline-block', backgroundColor: colors.white, padding: '16px', borderRadius: '8px', border: `2px solid ${colors.border}` }}>
          <QRCode value={qrValue} size={200} />
        </div>

        {guest?.user && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{guest.user.name}</p>
            <p style={{ color: colors.textMuted, fontSize: '14px', margin: '4px 0 0' }}>{guest.user.email}</p>
          </div>
        )}

        <div style={{ marginTop: '20px', backgroundColor: colors.accentLight, borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: colors.accent, fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>GUEST #{guestId}</p>
        </div>
      </div>
    </div>
  )
}

export default MyQRPage
