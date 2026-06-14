import React, { useState } from 'react';

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

const StaffDashboard = () => {
  const [events] = useState([
    { id: 1, name: 'Corporate Gala', date: '2026-06-20', location: 'Cairo', role: 'Catering' },
    { id: 2, name: 'Wedding Reception', date: '2026-06-25', location: 'Alexandria', role: 'Logistics' },
    { id: 3, name: 'Product Launch', date: '2026-07-01', location: 'Cairo', role: 'Seating' },
  ]);

  const [filterDate, setFilterDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredEvents = filterDate
    ? events.filter(e => e.date === filterDate)
    : events;

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
          <a href="/staff/dashboard" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>📋 My Events</a>
          <a href="/staff/tasks" style={{ color: colors.accentLight, textDecoration: 'none' }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: colors.accentLight, textDecoration: 'none' }}>🗺️ Floor Plan</a>
          <a href="/staff/checkin" style={{ color: colors.accentLight, textDecoration: 'none' }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: colors.accentLight, textDecoration: 'none' }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: colors.accentLight, textDecoration: 'none' }}>📊 Day-Of Dashboard</a>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        
        {/* Topbar */}
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
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: colors.text
            }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Staff Dashboard</span>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          
          {/* Filter */}
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

          {/* Events Table */}
          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ color: colors.text, margin: 0 }}>My Events</h2>
            </div>
            {filteredEvents.length === 0 ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>No events found for this date.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.accentLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>My Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, index) => (
                    <tr key={event.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                      <td style={{ padding: '12px 16px', color: colors.text }}>{event.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{event.date}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{event.location}</td>
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