import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getSourcingRequests } from '../services/api';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#FBF7F4',
  },
  main: {
    marginLeft: '240px',
    padding: '30px',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2C1810',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #EDE0D9',
    fontSize: '14px',
    color: '#2C1810',
    backgroundColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EDE0D9',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontWeight: '600',
    color: '#2C1810',
    fontSize: '15px',
  },
  cardMeta: {
    color: '#8B6555',
    fontSize: '13px',
    marginTop: '4px',
  },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#E8F5EE' : color === 'red' ? '#FDECEA' : '#F5EDE8',
    color: color === 'green' ? '#2D7A4F' : color === 'red' ? '#C0392B' : '#C4622D',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  }),
  empty: {
    textAlign: 'center',
    color: '#8B6555',
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