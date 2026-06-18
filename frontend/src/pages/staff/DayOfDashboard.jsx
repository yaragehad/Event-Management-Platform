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

const DayOfDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [data, setData] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`http://localhost:3001/api/staff/events/${user.id}`)
      .then(res => {
        setEvents(res.data);
        if (res.data.length === 1) setSelectedEventId(String(res.data[0].id));
      })
      .catch(err => console.error('Failed to fetch events:', err))
      .finally(() => setLoadingEvents(false));
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) { setData(null); return; }
    setLoadingData(true);
    axios.get(`http://localhost:3001/api/staff/dayof/${selectedEventId}`)
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to fetch day-of data:', err))
      .finally(() => setLoadingData(false));
  }, [selectedEventId]);

  const arrivalPercentage = data
    ? Math.round((data.arrivedGuests / data.totalGuests) * 100) || 0
    : 0;

  const currentPath = window.location.pathname;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box' }}>

      {/* Sidebar */}
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
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Day-Of Dashboard</span>
          <span style={{ backgroundColor: colors.greenBg, color: colors.green, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            LIVE
          </span>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Event Selector */}
          <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Select Event:</label>
            {loadingEvents ? (
              <span style={{ color: colors.textMuted }}>Loading events...</span>
            ) : events.length === 0 ? (
              <span style={{ color: colors.textMuted }}>You are not assigned to any events.</span>
            ) : (
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                style={{ border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '6px 12px', color: colors.text, backgroundColor: colors.cream, fontSize: '14px' }}
              >
                <option value="">-- Choose an event --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} — {new Date(ev.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loadingData ? (
            <p style={{ color: colors.textMuted }}>Loading...</p>
          ) : data ? (
            <>
              {/* Event Info */}
              <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text }}>{data.eventName}</div>
                  <div style={{ color: colors.textMuted, fontSize: '14px' }}>{new Date(data.date).toLocaleDateString()}</div>
                </div>
                <span style={{ backgroundColor: colors.greenBg, color: colors.green, padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                  {data.status}
                </span>
              </div>

              {/* Guest Stats */}
              <h3 style={{ color: colors.text, marginBottom: '12px' }}>Guest Attendance</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}`, borderRadius: '8px', padding: '24px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors.accent }}>{data.totalGuests}</div>
                  <div style={{ color: colors.accent, fontSize: '14px' }}>Total Guests</div>
                </div>
                <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '24px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors.green }}>{data.arrivedGuests}</div>
                  <div style={{ color: colors.green, fontSize: '14px' }}>Arrived Guests</div>
                </div>
                <div style={{ backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '24px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors.red }}>{data.totalGuests - data.arrivedGuests}</div>
                  <div style={{ color: colors.red, fontSize: '14px' }}>Not Yet Arrived</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: colors.text, fontWeight: 'bold' }}>Arrival Progress</span>
                  <span style={{ color: colors.accent, fontWeight: 'bold' }}>{arrivalPercentage}%</span>
                </div>
                <div style={{ backgroundColor: colors.border, borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: colors.green, width: `${arrivalPercentage}%`, height: '100%', borderRadius: '999px' }} />
                </div>
              </div>

              {/* Vendor Stats */}
              <h3 style={{ color: colors.text, marginBottom: '12px' }}>Vendor Arrivals</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}`, borderRadius: '8px', padding: '24px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors.accent }}>{data.totalVendors}</div>
                  <div style={{ color: colors.accent, fontSize: '14px' }}>Total Vendors</div>
                </div>
                <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '24px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors.green }}>{data.arrivedVendors}</div>
                  <div style={{ color: colors.green, fontSize: '14px' }}>Arrived Vendors</div>
                </div>
                <div style={{ backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '24px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors.red }}>{data.totalVendors - data.arrivedVendors}</div>
                  <div style={{ color: colors.red, fontSize: '14px' }}>Pending Vendors</div>
                </div>
              </div>
            </>
          ) : selectedEventId ? (
            <p style={{ color: colors.textMuted }}>No data available.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DayOfDashboard;
