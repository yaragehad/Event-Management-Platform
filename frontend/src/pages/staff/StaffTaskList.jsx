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

const StaffTaskList = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/staff/tasks/${user.id}`);
        setTasks(response.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:3001/api/staff/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const filteredTasks = filterStatus === 'All'
    ? tasks
    : tasks.filter(t => t.status === filterStatus.toUpperCase().replace(' ', '_'));

  const getStatusStyle = (status) => {
    if (status === 'DONE') return { backgroundColor: colors.greenBg, color: colors.green };
    if (status === 'IN_PROGRESS') return { backgroundColor: colors.accentLight, color: colors.accent };
    return { backgroundColor: colors.redBg, color: colors.red };
  };

  const formatStatus = (status) => {
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'DONE') return 'Done';
    return 'Pending';
  };

  const currentPath = window.location.pathname;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box' }}>

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
          <a href="/staff/dashboard" style={{ color: currentPath === '/staff/dashboard' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dashboard' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dashboard' ? 600 : 400 }}>🏠 Dashboard</a>
          <a href="/staff/tasks" style={{ color: currentPath === '/staff/tasks' ? colors.white : '#c9b9a8', background: currentPath === '/staff/tasks' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/tasks' ? 600 : 400 }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: currentPath === '/staff/floorplan' ? colors.white : '#c9b9a8', background: currentPath === '/staff/floorplan' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/floorplan' ? 600 : 400 }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: currentPath === '/staff/checkin' ? colors.white : '#c9b9a8', background: currentPath === '/staff/checkin' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/checkin' ? 600 : 400 }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: currentPath === '/staff/vendors' ? colors.white : '#c9b9a8', background: currentPath === '/staff/vendors' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/vendors' ? 600 : 400 }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: currentPath === '/staff/dayof' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dayof' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dayof' ? 600 : 400 }}>📊 Day-Of Dashboard</a>
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>My Tasks</span>
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
            gap: '12px'
          }}>
            <label style={{ color: colors.text, fontWeight: 'bold' }}>Filter by Status:</label>
            {['All', 'Pending', 'In Progress', 'Done'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  backgroundColor: filterStatus === status ? colors.accent : colors.white,
                  color: filterStatus === status ? colors.white : colors.text,
                  fontWeight: filterStatus === status ? 'bold' : 'normal'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ color: colors.text, margin: 0 }}>Assigned Tasks</h2>
            </div>
            {loading ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <p style={{ padding: '20px', color: colors.textMuted }}>No tasks found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.accentLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Task</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Event</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Category</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr key={task.id} style={{ backgroundColor: index % 2 === 0 ? colors.white : colors.cream }}>
                      <td style={{ padding: '12px 16px', color: colors.text }}>{task.title}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{task.event}</td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>{task.category}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          ...getStatusStyle(task.status),
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}>
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: colors.text,
                            backgroundColor: colors.cream,
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
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

export default StaffTaskList;
