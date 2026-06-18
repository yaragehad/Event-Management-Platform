import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getSourcingRequests, getDeliveries, getInvoices } from '../services/api';

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#fdf4e9',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    padding: '12px',
    gap: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    padding: '20px 24px',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#241407',
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  subtitle: {
    color: '#8a7a68',
    fontSize: '14px',
    marginTop: '4px',
  },
  cardsRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #f0e3d2',
    borderRadius: '16px',
    padding: '20px',
    flex: '1',
    minWidth: '160px',
    boxShadow: '0 2px 8px rgba(27,15,6,0.06)',
  },
  cardLabel: {
    color: '#8a7a68',
    fontSize: '13px',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1b0f06',
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #f0e3d2',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(27,15,6,0.06)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#241407',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '1px solid #f0e3d2',
    color: '#8a7a68',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #f0e3d2',
    color: '#241407',
    fontSize: '14px',
  },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#e7f7ee' : color === 'red' ? '#ffe7dc' : '#ffe7dc',
    color: color === 'green' ? '#0f7a44' : color === 'red' ? '#c83e16' : '#ff5a2c',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  }),
};

function VendorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (user?.vendorId) {
      getSourcingRequests({ vendorId: user.vendorId }).then(r => setRequests(r.data)).catch(() => {});
      getDeliveries({ vendorId: user.vendorId }).then(r => setDeliveries(r.data)).catch(() => {});
      getInvoices({ vendorId: user.vendorId }).then(r => setInvoices(r.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:3001/api/notifications/${user.id}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setNotifications(data))
      .catch(() => {});
  }, [user?.id]);

  const markAllRead = () => {
    if (!user?.id) return;
    fetch(`http://localhost:3001/api/notifications/read-all/${user.id}`, { method: 'PUT' })
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))))
      .catch(() => {});
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const activeDeliveries = deliveries.filter(d => d.status !== 'DELIVERED').length;
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING_REVIEW').length;

  const getStatusColor = (status) => {
    if (['ACCEPTED', 'DELIVERED', 'PAID'].includes(status)) return 'green';
    if (['DECLINED'].includes(status)) return 'red';
    return 'orange';
  };

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div style={styles.title}>Welcome, {user?.name} 👋</div>
          <div style={styles.subtitle}>Here's your vendor dashboard overview</div>
        </div>

        <div style={styles.cardsRow}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Pending Requests</div>
            <div style={styles.cardValue}>{pendingRequests}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Active Deliveries</div>
            <div style={styles.cardValue}>{activeDeliveries}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Pending Invoices</div>
            <div style={styles.cardValue}>{pendingInvoices}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Total Invoices</div>
            <div style={styles.cardValue}>{invoices.length}</div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Recent Sourcing Requests</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Delivery Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.event?.name || 'N/A'}</td>
                  <td style={styles.td}>{r.items}</td>
                  <td style={styles.td}>{new Date(r.deliveryDate).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(getStatusColor(r.status))}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td style={styles.td} colSpan={4}>No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Recent Invoices</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Invoice ID</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map(i => (
                <tr key={i.id}>
                  <td style={styles.td}>#{i.id}</td>
                  <td style={styles.td}>${i.amount}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(getStatusColor(i.status))}>{i.status}</span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td style={styles.td} colSpan={3}>No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default VendorDashboard;