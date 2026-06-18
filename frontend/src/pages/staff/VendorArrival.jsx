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

const VendorArrival = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const events = [
    { id: '1', name: 'Annual Tech Summit 2026' },
    { id: '2', name: 'Summer Gala Dinner' },
    { id: '3', name: 'Product Launch: NovaTech X1' },
  ];

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/staff/vendors/${selectedEvent}`);
        setVendors(response.data);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, [selectedEvent]);

  const handleArrival = async (id, requestId, currentArrived) => {
    try {
      await axios.patch(`http://localhost:3001/api/staff/vendors/${requestId}/arrived`, {
        arrived: !currentArrived
      });
      setVendors(vendors.map(v => v.id === id ? { ...v, arrived: !currentArrived } : v));
    } catch (err) {
      console.error('Failed to update vendor arrival:', err);
    }
  };

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
          <a href="/staff/floorplan" style={{ color: colors.accentLight, textDecoration: 'none' }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: colors.accentLight, textDecoration: 'none' }}>👥 Guest Check-In</a>
          <a href="/checkin/1" style={{ color: colors.accentLight, textDecoration: 'none' }}>📷 QR Check-In</a>
          <a href="/staff/vendors" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: colors.accentLight, textDecoration: 'none' }}>📊 Day-Of Dashboard</a>
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
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Vendor Arrival</span>
        </div>

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

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.green }}>{vendors.filter(v => v.arrived).length}</div>
              <div style={{ color: colors.green, fontSize: '13px' }}>Arrived</div>
            </div>
            <div style={{ backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.red }}>{vendors.filter(v => !v.arrived).length}</div>
              <div style={{ color: colors.red, fontSize: '13px' }}>Not Arrived</div>
            </div>
            <div style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}`, borderRadius: '8px', padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.accent }}>{vendors.length}</div>
              <div style={{ color: colors.accent, fontSize: '13px' }}>Total Vendors</div>
            </div>
          </div>

          {/* Vendor Table */}
          <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ color: colors.text, margin: 0 }}>Vendor List</h2>
            </div>
            {loading ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>Loading vendors...</p>
            ) : vendors.length === 0 ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>No vendors for this event.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.accentLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Vendor Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Supplies</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, index) => (
                    <tr key={vendor.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                      <td style={{ padding: '12px 16px', color: colors.text }}>{vendor.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{vendor.supplies}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: vendor.arrived ? colors.greenBg : colors.redBg,
                          color: vendor.arrived ? colors.green : colors.red,
                          padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold'
                        }}>
                          {vendor.arrived ? 'Arrived' : 'Not Arrived'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleArrival(vendor.id, vendor.requestId, vendor.arrived)}
                          style={{
                            backgroundColor: vendor.arrived ? colors.redBg : colors.greenBg,
                            color: vendor.arrived ? colors.red : colors.green,
                            border: `1px solid ${vendor.arrived ? colors.red : colors.green}`,
                            borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                          }}>
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
