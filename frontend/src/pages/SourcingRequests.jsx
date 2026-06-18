import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getSourcingRequests } from '../services/api';

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#241407',
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #f0e3d2',
    fontSize: '14px',
    color: '#241407',
    backgroundColor: '#fffaf3',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #f0e3d2',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '12px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(27,15,6,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#241407',
    fontSize: '15px',
  },
  cardMeta: {
    color: '#8a7a68',
    fontSize: '13px',
    marginTop: '4px',
  },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#e7f7ee' : color === 'red' ? '#ffe7dc' : '#ffe7dc',
    color: color === 'green' ? '#0f7a44' : color === 'red' ? '#c83e16' : '#ff5a2c',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  }),
  empty: {
    textAlign: 'center',
    color: '#8a7a68',
    padding: '40px',
  },
};

function SourcingRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user?.vendorId) {
      getSourcingRequests({ vendorId: user.vendorId })
        .then(r => setRequests(r.data))
        .catch(() => {});
    }
  }, [user]);

  const getStatusColor = (status) => {
    if (status === 'ACCEPTED') return 'green';
    if (status === 'DECLINED') return 'red';
    return 'orange';
  };

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div style={styles.title}>Sourcing Requests</div>
        </div>

        <div style={styles.filterRow}>
          <select style={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>

        {filtered.length === 0 && <div style={styles.empty}>No requests found</div>}

        {filtered.map(r => (
          <div key={r.id} style={styles.card} onClick={() => navigate(`/vendor/requests/${r.id}`)}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>{r.event?.name || 'Event'} — {r.items}</div>
              <span style={styles.badge(getStatusColor(r.status))}>{r.status}</span>
            </div>
            <div style={styles.cardMeta}>Quantity: {r.quantity} | Delivery: {new Date(r.deliveryDate).toLocaleDateString()}</div>
            {r.notes && <div style={styles.cardMeta}>Notes: {r.notes}</div>}
          </div>
        ))}
      </main>
    </div>
  );
}

export default SourcingRequests;