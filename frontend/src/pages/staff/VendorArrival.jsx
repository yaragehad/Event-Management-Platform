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

const VendorArrival = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [vendors, setVendors] = useState([
    { id: 1, name: 'Cairo Catering Co.', supplies: 'Food & Beverages', event: 'Corporate Gala', arrived: false },
    { id: 2, name: 'Elite Flowers', supplies: 'Floral Decorations', event: 'Corporate Gala', arrived: true },
    { id: 3, name: 'Sound Masters', supplies: 'AV Equipment', event: 'Wedding Reception', arrived: false },
    { id: 4, name: 'Luxe Linen', supplies: 'Table Linen & Covers', event: 'Wedding Reception', arrived: true },
    { id: 5, name: 'Fresh Bites', supplies: 'Snacks & Refreshments', event: 'Product Launch', arrived: false },
    { id: 6, name: 'Tech Setup Pro', supplies: 'Tech & Screens', event: 'Product Launch', arrived: false },
  ]);

  const events = ['All', 'Corporate Gala', 'Wedding Reception', 'Product Launch'];

  const handleArrival = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, arrived: !v.arrived } : v));
  };

  const filteredVendors = selectedEvent === 'All'
    ? vendors
    : vendors.filter(v => v.event === selectedEvent);

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
          <a href="/staff/vendors" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>🚚 Vendor Arrival</a>
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
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Vendor Arrival</span>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>

          {/* Event Filter */}
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
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Filter by Event:</label>
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

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              backgroundColor: colors.greenBg,
              border: `1px solid ${colors.green}`,
              borderRadius: '8px',
              padding: '16px 24px',
              flex: 1,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.green }}>
                {vendors.filter(v => v.arrived).length}
              </div>
              <div style={{ color: colors.green, fontSize: '13px' }}>Arrived</div>
            </div>
            <div style={{
              backgroundColor: colors.redBg,
              border: `1px solid ${colors.red}`,
              borderRadius: '8px',
              padding: '16px 24px',
              flex: 1,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.red }}>
                {vendors.filter(v => !v.arrived).length}
              </div>
              <div style={{ color: colors.red, fontSize: '13px' }}>Not Arrived</div>
            </div>
            <div style={{
              backgroundColor: colors.accentLight,
              border: `1px solid ${colors.accent}`,
              borderRadius: '8px',
              padding: '16px 24px',
              flex: 1,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.accent }}>
                {vendors.length}
              </div>
              <div style={{ color: colors.accent, fontSize: '13px' }}>Total Vendors</div>
            </div>
          </div>

          {/* Vendor Table */}
          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ color: colors.text, margin: 0 }}>Vendor List</h2>
            </div>
            {filteredVendors.length === 0 ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>No vendors found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.accentLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Vendor Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Supplies</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor, index) => (
                    <tr key={vendor.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                      <td style={{ padding: '12px 16px', color: colors.text }}>{vendor.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{vendor.supplies}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{vendor.event}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: vendor.arrived ? colors.greenBg : colors.redBg,
                          color: vendor.arrived ? colors.green : colors.red,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}>
                          {vendor.arrived ? 'Arrived' : 'Not Arrived'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleArrival(vendor.id)}
                          style={{
                            backgroundColor: vendor.arrived ? colors.redBg : colors.greenBg,
                            color: vendor.arrived ? colors.red : colors.green,
                            border: `1px solid ${vendor.arrived ? colors.red : colors.green}`,
                            borderRadius: '6px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          {vendor.arrived ? 'Undo Arrival' : 'Mark Arrived'}
                        </button>
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

export default VendorArrival;