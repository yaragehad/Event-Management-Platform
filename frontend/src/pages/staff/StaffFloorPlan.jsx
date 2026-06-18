import React, { useState, useEffect } from 'react';
import { getLayout } from '../../services/venueService';

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

const COLORS = {
  'Table': '#3b82f6',
  'Stage': '#8b5cf6',
  'Chair': '#f59e0b',
  'Bar': '#ec4899',
  'Exit': '#10b981',
  'Dance Floor': '#f97316'
};

const StaffFloorPlan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await getLayout(1);
        setElements(response.data.elements || []);
      } catch (err) {
        setError('Layout not yet available. Waiting for organizer to share.');
        setElements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, []);

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
          <a href="/staff/floorplan" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: colors.accentLight, textDecoration: 'none' }}>👥 Guest Check-In</a>
          <a href="/checkin/1" style={{ color: colors.accentLight, textDecoration: 'none' }}>📷 QR Check-In</a>
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
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Venue Layout</span>
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
              <h2 style={{ color: colors.text, margin: 0 }}>Venue Layout</h2>
              <span style={{ color: colors.textMuted, fontSize: '13px' }}>Shared by Organizer • View Only</span>
            </div>

            <div style={{ padding: '24px' }}>
              {loading ? (
                <p style={{ color: colors.textMuted }}>Loading layout...</p>
              ) : error ? (
                <div style={{
                  backgroundColor: colors.accentLight,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '8px',
                  padding: '16px',
                  color: colors.accent
                }}>
                  {error}
                </div>
              ) : elements.length === 0 ? (
                <p style={{ color: colors.textMuted }}>No layout has been shared yet.</p>
              ) : (
                <div style={{
                  width: '100%',
                  height: '550px',
                  border: `2px dashed ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.cream,
                  position: 'relative'
                }}>
                  {elements.map(el => (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: el.x,
                        top: el.y,
                        backgroundColor: COLORS[el.type] || colors.accent,
                        color: colors.white,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        transform: 'translate(-50%, -50%)',
                        userSelect: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}
                    >
                      {el.type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legend */}
            {!loading && !error && elements.length > 0 && (
              <div style={{
                padding: '16px 24px',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                {Object.entries(COLORS).map(([type, color]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: color, borderRadius: '3px' }} />
                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffFloorPlan;
