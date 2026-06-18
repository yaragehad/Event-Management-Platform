import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

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

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/staff/events/${user.id}`);
        setEvents(response.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const filteredEvents = filterDate
    ? events.filter(e => new Date(e.date).toISOString().split('T')[0] === filterDate)
    : events;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box' }}>

      {sidebarOpen && (
        <div style={{
          width: '220px', height: 'calc(100vh - 24px)',
          backgroundColor: colors.sidebar, borderRadius: '20px',
          color: colors.white, padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          position: 'sticky', top: 0, alignSelf: 'flex-start',
          overflowY: 'auto', boxSizing: 'border-box', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,90,44,0.25)', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: colors.accent, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: colors.sidebar, flexShrink: 0 }}>S</div>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '17px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>StaffHub</span>
          </div>
          <div style={{ color: '#6b574a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', flexShrink: 0 }}>Menu</div>
          <a href="/staff/dashboard" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>📋 My Events</a>
          <a href="/staff/tasks" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>📊 Day-Of Dashboard</a>
        </div>
      )}

      <div style={{ flex: 1 }}>

        <div style={{
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Staff Dashboard</span>
        </div>

        <div style={{ padding: '24px' }}>

          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Filter by Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 10px',
                color: colors.text,
                backgroundColor: colors.cream
              }}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ color: colors.text, margin: 0 }}>My Events</h2>
            </div>
            {loading ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>No events found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.accentLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>My Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, index) => (
                    <tr key={event.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                      <td style={{ padding: '12px 16px', color: colors.text }}>{event.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{new Date(event.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{event.status}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: colors.accentLight,
                          color: colors.accent,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}>
                          {event.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
