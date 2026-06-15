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

const GuestCheckIn = () => {
  const [guests, setGuests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/staff/guests/1');
        setGuests(response.data);
      } catch (err) {
        console.error('Failed to fetch guests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuests();
  }, []);

  const handleCheckIn = async (id, currentStatus) => {
    try {
      await axios.patch(`http://localhost:3001/api/staff/guests/${id}/checkin`, {
        checkedIn: !currentStatus
      });
      setGuests(guests.map(g => g.id === id ? { ...g, checkedIn: !currentStatus } : g));
    } catch (err) {
      console.error('Failed to update check-in:', err);
    }
  };

  const filteredGuests = guests.filter(g => {
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Checked In' && g.checkedIn) ||
      (filterStatus === 'Not Checked In' && !g.checkedIn);
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          <a href="/staff/checkin" style={{ color: colors.accentLight, textDecoration: 'none', fontWeight: 'bold' }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: colors.accentLight, textDecoration: 'none' }}>🚚 Vendor Arrival</a>
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
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Guest Check-In</span>
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
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search guest name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                color: colors.text,
                backgroundColor: colors.cream,
                width: '200px'
              }}
            />
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Filter:</label>
            {['All', 'Checked In', 'Not Checked In'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  backgroundColor: filterStatus === status ? colors.accent : colors.white,
                  color: filterStatus === status ? colors.white : colors.text,
                  fontWeight: filterStatus === status ? 'bold' : 'normal'
                }}>
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: colors.greenBg, border: `1px solid ${colors.green}`, borderRadius: '8px', padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.green }}>{guests.filter(g => g.checkedIn).length}</div>
              <div style={{ color: colors.green, fontSize: '13px' }}>Checked In</div>
            </div>
            <div style={{ backgroundColor: colors.redBg, border: `1px solid ${colors.red}`, borderRadius: '8px', padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.red }}>{guests.filter(g => !g.checkedIn).length}</div>
              <div style={{ color: colors.red, fontSize: '13px' }}>Not Checked In</div>
            </div>
            <div style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}`, borderRadius: '8px', padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.accent }}>{guests.length}</div>
              <div style={{ color: colors.accent, fontSize: '13px' }}>Total Guests</div>
            </div>
          </div>

          <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ color: colors.text, margin: 0 }}>Guest List</h2>
            </div>
            {loading ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>Loading guests...</p>
            ) : filteredGuests.length === 0 ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>No guests found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.accentLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Guest Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>RSVP</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest, index) => (
                    <tr key={guest.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                      <td style={{ padding: '12px 16px', color: colors.text }}>{guest.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{guest.event}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{guest.rsvp}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: guest.checkedIn ? colors.greenBg : colors.redBg,
                          color: guest.checkedIn ? colors.green : colors.red,
                          padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold'
                        }}>
                          {guest.checkedIn ? 'Checked In' : 'Not Checked In'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleCheckIn(guest.id, guest.checkedIn)}
                          style={{
                            backgroundColor: guest.checkedIn ? colors.redBg : colors.greenBg,
                            color: guest.checkedIn ? colors.red : colors.green,
                            border: `1px solid ${guest.checkedIn ? colors.red : colors.green}`,
                            borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                          }}>
                          {guest.checkedIn ? 'Undo Check-In' : 'Check In'}
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

export default GuestCheckIn;