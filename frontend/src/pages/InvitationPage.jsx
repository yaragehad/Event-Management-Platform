import React from 'react'

const colors = {
  accent: '#C4622D',
  accentLight: '#F5EDE8',
  cream: '#FBF7F4',
  border: '#EDE0D9',
  text: '#2C1810',
  textMuted: '#8B6555',
  white: '#FFFFFF',
}

function InvitationPage() {
  const event = {
    name: 'Annual Gala Night',
    date: 'June 20, 2026',
    time: '7:00 PM',
    venue: 'The Grand Hall, Cairo',
    dressCode: 'Formal',
    agenda: 'Welcome reception, Dinner, Awards ceremony, Live music',
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: colors.accent, padding: '32px', textAlign: 'center' }}>
          <h1 style={{ color: colors.white, margin: 0, fontSize: '28px' }}>You're Invited!</h1>
          <p style={{ color: colors.accentLight, margin: '8px 0 0', fontSize: '16px' }}>Please join us for a special evening</p>
        </div>

        {/* Event Details */}
        <div style={{ padding: '32px' }}>
          <h2 style={{ color: colors.text, fontSize: '24px', marginBottom: '24px' }}>{event.name}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <div>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>DATE</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: 'bold' }}>{event.date}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>⏰</span>
              <div>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>TIME</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: 'bold' }}>{event.time}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <div>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>VENUE</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: 'bold' }}>{event.venue}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>👔</span>
              <div>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>DRESS CODE</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: 'bold' }}>{event.dressCode}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>📋</span>
              <div>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>AGENDA</p>
                <p style={{ margin: 0, color: colors.text, fontWeight: 'bold' }}>{event.agenda}</p>
              </div>
            </div>
          </div>

          {/* RSVP Button */}
          <a href="/rsvp/1" style={{ display: 'block', marginTop: '32px', backgroundColor: colors.accent, color: colors.white, textAlign: 'center', padding: '14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
            RSVP Now
          </a>
        </div>
      </div>
    </div>
  )
}

export default InvitationPage