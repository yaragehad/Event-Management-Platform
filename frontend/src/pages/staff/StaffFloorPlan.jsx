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

const StaffFloorPlan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('Corporate Gala');

  const events = ['Corporate Gala', 'Wedding Reception', 'Product Launch'];

  const floorPlanElements = [
    { id: 1, label: 'Stage', x: 300, y: 50, width: 200, height: 60, color: '#C4622D' },
    { id: 2, label: 'Table 1', x: 100, y: 180, width: 100, height: 60, color: '#8B6555' },
    { id: 3, label: 'Table 2', x: 250, y: 180, width: 100, height: 60, color: '#8B6555' },
    { id: 4, label: 'Table 3', x: 400, y: 180, width: 100, height: 60, color: '#8B6555' },
    { id: 5, label: 'Table 4', x: 550, y: 180, width: 100, height: 60, color: '#8B6555' },
    { id: 6, label: 'Bar Area', x: 50, y: 320, width: 120, height: 60, color: '#2D7A4F' },
    { id: 7, label: 'Catering', x: 620, y: 320, width: 120, height: 60, color: '#2D7A4F' },
    { id: 8, label: 'Entrance', x: 330, y: 380, width: 140, height: 50, color: '#6B2D0E' },
  ];

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
          <a href="/staff/floorplan" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>🗺️ Floor Plan</a>
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
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Floor Plan</span>
          <span style={{
            backgroundColor: colors.accentLight,
            color: colors.accent,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            READ ONLY
          </span>
        </div>

        {/* Page Content */}
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
            gap: '12px'
          }}>
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Select Event:</label>
            {events.map(event => (
              <button
                key={event}
                onClick={() => setSelectedEvent(event)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  backgroundColor: selectedEvent === event ? colors.accent : colors.white,
                  color: selectedEvent === event ? colors.white : colors.text,
                  fontWeight: selectedEvent === event ? 'bold' : 'normal'
                }}
              >
                {event}
              </button>
            ))}
          </div>

          {/* Floor Plan Canvas */}
          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ color: colors.text, margin: 0 }}>
                {selectedEvent} — Venue Layout
              </h2>
              <span style={{ color: colors.textMuted, fontSize: '13px' }}>
                Shared by Organizer • View Only
              </span>
            </div>

            <div style={{ padding: '24px' }}>
              <svg
                width="100%"
                viewBox="0 0 800 480"
                style={{
                  border: `2px dashed ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.cream
                }}
              >
                {floorPlanElements.map(el => (
                  <g key={el.id}>
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx="6"
                      fill={el.color}
                      opacity="0.85"
                    />
                    <text
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2 + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="13"
                      fontWeight="bold"
                    >
                      {el.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              gap: '24px'
            }}>
              {[
                { color: '#C4622D', label: 'Stage' },
                { color: '#8B6555', label: 'Tables' },
                { color: '#2D7A4F', label: 'Service Areas' },
                { color: '#6B2D0E', label: 'Entrance/Exit' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: item.color, borderRadius: '3px' }} />
                  <span style={{ color: colors.textMuted, fontSize: '13px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffFloorPlan;