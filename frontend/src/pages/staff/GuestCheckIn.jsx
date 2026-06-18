import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

const GuestCheckIn = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guests, setGuests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const navigate = useNavigate();

  // Load staff's assigned events
  useEffect(() => {
    if (!user?.id) return;
    axios.get(`http://localhost:3001/api/staff/events/${user.id}`)
      .then(res => {
        setEvents(res.data);
        if (res.data.length === 1) {
          setSelectedEventId(String(res.data[0].id));
        }
      })
      .catch(err => console.error('Failed to fetch events:', err))
      .finally(() => setLoadingEvents(false));
  }, [user]);

  // Load guests whenever selected event changes
  useEffect(() => {
    if (!selectedEventId) { setGuests([]); return; }
    setLoadingGuests(true);
    axios.get(`http://localhost:3001/api/staff/guests/${selectedEventId}`)
      .then(res => setGuests(res.data))
      .catch(err => console.error('Failed to fetch guests:', err))
      .finally(() => setLoadingGuests(false));
  }, [selectedEventId]);

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

  const currentPath = window.location.pathname;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box' }}>

      {sidebarOpen && (
        <div style={{ width: '220px', height: 'calc(100vh - 24px)', backgroundColor: colors.sidebar, borderRadius: '20px', color: colors.white, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: 0, alignSelf: 'flex-start', overflowY: 'auto', boxSizing: 'border-box', flexShrink: 0 }}>
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
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Guest Check-In</span>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Event selector */}
          <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <label style={{ color: colors.text, fontWeight: 'bold', marginRight: '12px' }}>Select Event:</label>
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
              {/* Search + filter */}
              <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search guest name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '6px 12px', color: colors.text, backgroundColor: colors.cream, width: '200px' }}
                />
                <label style={{ color: colors.text, fontWeight: 'bold' }}>Filter:</label>
                {['All', 'Checked In', 'Not Checked In'].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', border: `1px solid ${colors.border}`, cursor: 'pointer',
                      backgroundColor: filterStatus === status ? colors.accent : colors.white,
                      color: filterStatus === status ? colors.white : colors.text,
                      fontWeight: filterStatus === status ? 'bold' : 'normal'
                    }}>
                    {status}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
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

              {/* Guest table */}
              <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                  <h2 style={{ color: colors.text, margin: 0 }}>Guest List</h2>
                </div>
                {loadingGuests ? (
                  <p style={{ padding: '20px', color: colors.textMuted }}>Loading guests...</p>
                ) : filteredGuests.length === 0 ? (
                  <p style={{ padding: '20px', color: colors.textMuted }}>No guests found for this event.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.accentLight }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Guest Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>RSVP</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Actions</th>
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
                          <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleCheckIn(guest.id, guest.checkedIn)}
                              style={{
                                backgroundColor: guest.checkedIn ? colors.redBg : colors.greenBg,
                                color: guest.checkedIn ? colors.red : colors.green,
                                border: `1px solid ${guest.checkedIn ? colors.red : colors.green}`,
                                borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                              }}>
                              {guest.checkedIn ? 'Undo Check-In' : 'Check In'}
                            </button>
                            <button onClick={() => navigate(`/staff/guest/${guest.id}`)}
                              style={{
                                backgroundColor: colors.accentLight,
                                color: colors.accent,
                                border: `1px solid ${colors.accent}`,
                                borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                              }}>
                              View Details
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

export default GuestCheckIn;
