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

const QUICK_LINKS = [
  { icon: '✅', label: 'My Tasks', desc: 'View and manage your assigned tasks', href: '/staff/tasks', bg: colors.greenBg, iconColor: colors.green },
  { icon: '👥', label: 'Guest Check-In', desc: 'Check in guests and view attendance', href: '/staff/checkin', bg: colors.accentLight, iconColor: colors.accent },
  { icon: '🚚', label: 'Vendor Arrival', desc: 'Track vendor arrival status', href: '/staff/vendors', bg: '#e8f0fe', iconColor: '#3b5bdb' },
  { icon: '📊', label: 'Day-Of Dashboard', desc: 'Live event overview and progress', href: '/staff/dayof', bg: '#fff3e0', iconColor: '#e65100' },
  { icon: '🗺️', label: 'Venue Layout', desc: 'View and manage floor plans', href: '/staff/floorplan', bg: '#f3e5f5', iconColor: '#7b1fa2' },
];

const StaffDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      axios.get(`http://localhost:3001/api/staff/events/${user.id}`),
      axios.get(`http://localhost:3001/api/staff/tasks/${user.id}`),
    ])
      .then(([eventsRes, tasksRes]) => {
        setEvents(eventsRes.data);
        setTasks(tasksRes.data);
      })
      .catch(err => console.error('Failed to fetch dashboard data:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'S';

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
          <a href="/staff/dashboard" style={{ color: colors.white, textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', background: colors.accent, fontWeight: 600 }}>🏠 Dashboard</a>
          <a href="/staff/tasks" style={{ color: currentPath === '/staff/tasks' ? colors.white : '#c9b9a8', background: currentPath === '/staff/tasks' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/tasks' ? 600 : 400 }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: currentPath === '/staff/floorplan' ? colors.white : '#c9b9a8', background: currentPath === '/staff/floorplan' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/floorplan' ? 600 : 400 }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: currentPath === '/staff/checkin' ? colors.white : '#c9b9a8', background: currentPath === '/staff/checkin' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/checkin' ? 600 : 400 }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: currentPath === '/staff/vendors' ? colors.white : '#c9b9a8', background: currentPath === '/staff/vendors' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/vendors' ? 600 : 400 }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: currentPath === '/staff/dayof' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dayof' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dayof' ? 600 : 400 }}>📊 Day-Of Dashboard</a>
          <div style={{ flex: 1 }} />
          <button
            onClick={logout}
            style={{ marginTop: 12, padding: '11px 14px', backgroundColor: colors.accent, color: colors.white, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}
          >
            Log out
          </button>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderRadius: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}>
            ☰
          </button>
          <span style={{ fontWeight: 800, color: colors.text, fontSize: '20px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>Dashboard</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, background: colors.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: colors.white }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>Staff</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 0 24px 0' }}>

          {loading ? (
            <p style={{ color: colors.textMuted, padding: '20px' }}>Loading...</p>
          ) : (
            <>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: colors.accent, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>{events.length}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: 4 }}>Assigned Events</div>
                </div>
                <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: colors.red, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>{pendingTasks}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: 4 }}>Pending Tasks</div>
                </div>
                <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#e65100', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>{inProgressTasks}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: 4 }}>In Progress</div>
                </div>
                <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: colors.green, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>{doneTasks}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: 4 }}>Tasks Done</div>
                </div>
              </div>

              {/* Quick access */}
              <h3 style={{ color: colors.text, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 700, fontSize: '17px', marginBottom: '14px', marginTop: 0 }}>Quick Access</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
                {QUICK_LINKS.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{ textDecoration: 'none', backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
                  >
                    <div style={{ width: 42, height: 42, background: link.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {link.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: colors.text, fontSize: '14px', marginBottom: 4 }}>{link.label}</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.4 }}>{link.desc}</div>
                    </div>
                  </a>
                ))}
              </div>

              {/* My Events */}
              <h3 style={{ color: colors.text, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 700, fontSize: '17px', marginBottom: '14px', marginTop: 0 }}>My Events</h3>
              <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                {events.length === 0 ? (
                  <p style={{ padding: '20px', color: colors.textMuted }}>No events assigned.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.accentLight }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: 13 }}>Event Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: 13 }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: 13 }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: 13 }}>My Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => (
                        <tr key={event.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                          <td style={{ padding: '12px 16px', color: colors.text, fontWeight: 600 }}>{event.name}</td>
                          <td style={{ padding: '12px 16px', color: colors.textMuted }}>{new Date(event.date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ backgroundColor: colors.greenBg, color: colors.green, padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                              {event.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ backgroundColor: colors.accentLight, color: colors.accent, padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                              {event.role}
                            </span>
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

export default StaffDashboard;
