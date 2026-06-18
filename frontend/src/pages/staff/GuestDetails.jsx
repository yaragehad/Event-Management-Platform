import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const colors = {
  sidebar: '#6B2D0E',
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
};

const GuestDetails = () => {
  const { guestId } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/staff/guests/${guestId}/details`);
        setGuest(response.data);
      } catch (err) {
        console.error('Failed to fetch guest details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuest();
  }, [guestId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: 'sans-serif' }}>

      {sidebarOpen && (
        <div style={{ width: '220px', backgroundColor: colors.sidebar, color: colors.white, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ color: colors.white, marginBottom: '20px' }}>VenueHub</h2>
          <a href="/staff/dashboard" style={{ color: colors.accentLight, textDecoration: 'none' }}>📋 My Events</a>
          <a href="/staff/tasks" style={{ color: colors.accentLight, textDecoration: 'none' }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: colors.accentLight, textDecoration: 'none' }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>👥 Guest Check-In</a>
          <a href="/checkin/1" style={{ color: colors.accentLight, textDecoration: 'none' }}>📷 QR Check-In</a>
          <a href="/staff/vendors" style={{ color: colors.accentLight, textDecoration: 'none' }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: colors.accentLight, textDecoration: 'none' }}>📊 Day-Of Dashboard</a>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}>
            ☰
          </button>
          <button onClick={() => navigate('/staff/checkin')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.accent, fontSize: '16px' }}>
            ← Back to Guest List
          </button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Guest Details</span>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <p style={{ color: colors.textMuted }}>Loading guest details...</p>
          ) : !guest ? (
            <p style={{ color: colors.red }}>Guest not found.</p>
          ) : (
            <>
              {/* Guest Info Card */}
              <div style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: colors.text, margin: 0 }}>{guest.name}</h2>
                  <span style={{
                    backgroundColor: guest.checkedIn ? colors.greenBg : colors.redBg,
                    color: guest.checkedIn ? colors.green : colors.red,
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {guest.checkedIn ? '✅ Checked In' : '❌ Not Checked In'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ backgroundColor: colors.cream, borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '4px' }}>EMAIL</div>
                    <div style={{ color: colors.text, fontWeight: 'bold' }}>{guest.email}</div>
                  </div>
                  <div style={{ backgroundColor: colors.cream, borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '4px' }}>DIETARY PREFERENCE</div>
                    <div style={{ color: colors.text, fontWeight: 'bold' }}>{guest.dietaryPreference || 'None specified'}</div>
                  </div>
                </div>
              </div>

              {/* RSVP History */}
              <div style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                  <h3 style={{ color: colors.text, margin: 0 }}>RSVP History</h3>
                </div>
                {guest.rsvps && guest.rsvps.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.accentLight }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>RSVP Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guest.rsvps.map((rsvp, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                          <td style={{ padding: '12px 16px', color: colors.text }}>{rsvp.event}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              backgroundColor: rsvp.status === 'ATTENDING' ? colors.greenBg : rsvp.status === 'NOT_ATTENDING' ? colors.redBg : colors.accentLight,
                              color: rsvp.status === 'ATTENDING' ? colors.green : rsvp.status === 'NOT_ATTENDING' ? colors.red : colors.accent,
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: 'bold'
                            }}>
                              {rsvp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '20px', color: colors.textMuted }}>No RSVP records found.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestDetails;