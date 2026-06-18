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

const VendorArrival = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [vendors, setVendors] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(false);

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
    if (!selectedEventId) { setVendors([]); return; }
    setLoadingVendors(true);
    axios.get(`http://localhost:3001/api/staff/vendors/${selectedEventId}`)
      .then(res => setVendors(res.data))
      .catch(err => console.error('Failed to fetch vendors:', err))
      .finally(() => setLoadingVendors(false));
  }, [selectedEventId]);

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
          <a href="/staff/dashboard" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>📋 My Events</a>
          <a href="/staff/tasks" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: '#c9b9a8', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block' }}>📊 Day-Of Dashboard</a>
        </div>
      )}

      <div style={{ flex: 1 }}>

        <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}>
            ☰
          </button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Vendor Arrival</span>
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

          {selectedEventId && (
            <>
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
                {loadingVendors ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorArrival;
