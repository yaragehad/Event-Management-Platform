import React, { useState, useEffect } from 'react';
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

const DayOfDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('1');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const events = [
    { id: '1', name: 'Annual Tech Summit 2026' },
    { id: '2', name: 'Summer Gala Dinner' },
    { id: '3', name: 'Product Launch: NovaTech X1' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/staff/dayof/${selectedEvent}`);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch day-of data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedEvent]);

  const arrivalPercentage = data
    ? Math.round((data.arrivedGuests / data.totalGuests) * 100) || 0
    : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: '220px',
          backgroundColor: colors.sidebar,
          color: colors.white,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h2 style={{ color: colors.white, marginBottom: '20px' }}>VenueHub</h2>
          <a href="/staff/dashboard" style={{ color: colors.accentLight, textDecoration: 'none' }}>📋 My Events</a>
          <a href="/staff/tasks" style={{ color: colors.accentLight, textDecoration: 'none' }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: colors.accentLight, textDecoration: 'none' }}>🗺️ Floor Plan</a>
          <a href="/staff/checkin" style={{ color: colors.accentLight, textDecoration: 'none' }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: colors.accentLight, textDecoration: 'none' }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>📊 Day-Of Dashboard</a>
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
          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Select Event:</label>
            {events.map(event => (
              <button key={event.id} onClick={() => setSelectedEvent(event.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  backgroundColor: selectedEvent === event.id ? colors.accent : colors.white,
                  color: selectedEvent === event.id ? colors.white : colors.text,
                  fontWeight: selectedEvent === event.id ? 'bold' : 'normal'
                }}>
                {event.name}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: colors.textMuted }}>Loading...</p>
          ) : data ? (
            <>
              {/* Event Info */}
              <div style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                gap: '24px',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text }}>{data.eventName}</div>
                  <div style={{ color: colors.textMuted, fontSize: '14px' }}>{new Date(data.date).toLocaleDateString()}</div>
                </div>
                <span style={{
                  backgroundColor: colors.greenBg,
                  color: colors.green,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
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
          ) : (
            <p style={{ color: colors.textMuted }}>No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayOfDashboard;