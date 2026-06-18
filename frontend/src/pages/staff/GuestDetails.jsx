import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const colors = {
  sidebar: '#1b0f06',
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

  const currentPath = window.location.pathname;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box' }}>

      {sidebarOpen && (
        <div style={{ width: '220px', height: 'calc(100vh - 24px)', backgroundColor: colors.sidebar, borderRadius: '20px', color: colors.white, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: 0, alignSelf: 'flex-start', overflowY: 'auto', boxSizing: 'border-box', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,90,44,0.25)', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: colors.accent, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: colors.sidebar, flexShrink: 0 }}>S</div>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '17px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>StaffHub</span>
          </div>
          <div style={{ color: '#6b574a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', flexShrink: 0 }}>Menu</div>
          <a href="/staff/dashboard" style={{ color: currentPath === '/staff/dashboard' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dashboard' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dashboard' ? 600 : 400 }}>🏠 Dashboard</a>
          <a href="/staff/tasks" style={{ color: currentPath === '/staff/tasks' ? colors.white : '#c9b9a8', background: currentPath === '/staff/tasks' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/tasks' ? 600 : 400 }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: currentPath === '/staff/floorplan' ? colors.white : '#c9b9a8', background: currentPath === '/staff/floorplan' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/floorplan' ? 600 : 400 }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: currentPath === '/staff/checkin' ? colors.white : '#c9b9a8', background: currentPath === '/staff/checkin' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/checkin' ? 600 : 400 }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: currentPath === '/staff/vendors' ? colors.white : '#c9b9a8', background: currentPath === '/staff/vendors' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/vendors' ? 600 : 400 }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: currentPath === '/staff/dayof' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dayof' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dayof' ? 600 : 400 }}>📊 Day-Of Dashboard</a>
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